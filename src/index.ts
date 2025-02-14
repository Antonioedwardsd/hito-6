import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";

// Initialize Express and the HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Port configuration
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
// Serve static files (HTML, CSS, etc.) from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Route to serve the HTML (optional)
app.get("/", (req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

// Define interfaces for messages and users
interface Message {
	id: number;
	userId: string;
	username: string;
	content: string;
	timestamp: Date;
}

interface User {
	id: string;
	username: string;
	joinedAt: Date;
}

// Structures to store messages and connected users
const messages: Message[] = [];
const connectedUsers: Map<string, User> = new Map();

// Function to log WebSocket events (custom login)
const wsLogger = (event: string, ...args: any[]) => {
	console.log(`[WebSocket][${new Date().toISOString()}] ${event}:`, ...args);
};

// Function to handle user disconnections
function handleUserDisconnect(socket: Socket) {
	const user = connectedUsers.get(socket.id);
	if (user) {
		connectedUsers.delete(socket.id);
		io.emit("userLeft", {
			userId: socket.id,
			username: user.username,
			onlineUsers: Array.from(connectedUsers.values()),
		});
		wsLogger("leave", `User ${user.username} left the chat`);
	}
}

// Function to handle errors
function handleError(socket: Socket, event: string, error: any) {
	console.error(`[ERROR][${event}]`, error);
	socket.emit("error", {
		event,
		message: "An error occurred on the server",
		timestamp: new Date(),
	});
}

// Main Socket.IO configuration and event handling
io.on("connection", (socket: Socket) => {
	wsLogger("connect", `Client connected - ID: ${socket.id}`);

	// Send welcome message
	socket.emit("welcome", { message: "Welcome to the messaging server" });

	// Event for login/join
	socket.on("join", (userData: { username: string }) => {
		try {
			connectedUsers.set(socket.id, {
				id: socket.id,
				username: userData.username,
				joinedAt: new Date(),
			});
			wsLogger("join", `User ${userData.username} joined`);
			// Inform all users that a new user has joined
			io.emit("userJoined", {
				userId: socket.id,
				username: userData.username,
				onlineUsers: Array.from(connectedUsers.values()),
			});
		} catch (error) {
			handleError(socket, "join", error);
		}
	});

	// Event to handle sending messages
	socket.on("message", (data: { content: string }) => {
		try {
			const user = connectedUsers.get(socket.id);
			if (!user) throw new Error("User not authenticated");

			const messageData: Message = {
				id: Date.now(),
				userId: socket.id,
				username: user.username,
				content: data.content,
				timestamp: new Date(),
			};

			messages.push(messageData);
			wsLogger("message", `Message from ${user.username}: ${data.content}`);
			// Broadcast the message to all users
			io.emit("newMessage", messageData);
		} catch (error) {
			handleError(socket, "message", error);
		}
	});

	// Event for when the user leaves
	socket.on("leave", () => {
		try {
			handleUserDisconnect(socket);
		} catch (error) {
			handleError(socket, "leave", error);
		}
	});

	// Handle disconnection
	socket.on("disconnect", () => {
		try {
			wsLogger("disconnect", `Client disconnected - ID: ${socket.id}`);
			handleUserDisconnect(socket);
		} catch (error) {
			handleError(socket, "disconnect", error);
		}
	});

	// Reconnection attempt (optional)
	socket.on("reconnect_attempt", () => {
		wsLogger("reconnect_attempt", `Reconnection attempt - ID: ${socket.id}`);
	});
});
