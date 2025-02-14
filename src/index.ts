// src/index.ts
import express, { Request, Response } from "express";
import http from "node:http";
import { Server, Socket } from "socket.io";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Express middlewares and static files
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Create the /chat namespace
const chat = io.of("/chat");

interface Message {
	id: number;
	userId: string;
	username: string;
	content: string;
	timestamp: Date;
	room?: string;
}

interface User {
	id: string;
	username: string;
	joinedAt: Date;
}

// Global data structures for messages and connected users
const messages: Message[] = [];
const connectedUsers: Map<string, User> = new Map();

// Logger function for WebSocket events
const wsLogger = (event: string, ...args: any[]) => {
	console.log(`[WebSocket][${new Date().toISOString()}] ${event}:`, ...args);
};

// Handle user disconnection
function handleUserDisconnect(socket: Socket) {
	const user = connectedUsers.get(socket.id);
	if (user) {
		connectedUsers.delete(socket.id);
		chat.emit("userLeft", {
			userId: socket.id,
			username: user.username,
			onlineUsers: Array.from(connectedUsers.values()),
		});
		wsLogger("leave", `User ${user.username} left the chat`);
	}
}

// Handle errors
function handleError(socket: Socket, event: string, error: any) {
	console.error(`[ERROR][${event}]`, error);
	socket.emit("error", {
		event,
		message: "An error occurred on the server",
		timestamp: new Date(),
	});
}

// Socket.IO connection for the /chat namespace
chat.on("connection", (socket: Socket) => {
	console.log(`Client connected to /chat, ID: ${socket.id}`);

	// Send welcome message
	socket.emit("welcome", { message: "Welcome to the messaging server" });

	// Join event
	socket.on("join", (userData: { username: string }) => {
		try {
			connectedUsers.set(socket.id, {
				id: socket.id,
				username: userData.username,
				joinedAt: new Date(),
			});
			wsLogger("join", `User ${userData.username} joined`);
			chat.emit("userJoined", {
				userId: socket.id,
				username: userData.username,
				onlineUsers: Array.from(connectedUsers.values()),
			});
		} catch (error) {
			handleError(socket, "join", error);
		}
	});

	// Join room event
	socket.on("joinRoom", (room: string) => {
		try {
			socket.join(room);
			const user = connectedUsers.get(socket.id);
			if (user) {
				const roomMessage: Message = {
					id: Date.now(),
					userId: socket.id,
					username: user.username,
					content: `User ${user.username} joined ${room}`,
					timestamp: new Date(),
					room: room,
				};
				chat.to(room).emit("newMessage", roomMessage);
				wsLogger("joinRoom", `User ${user.username} joined ${room}`);
			}
		} catch (error) {
			handleError(socket, "joinRoom", error);
		}
	});

	// Leave room event
	socket.on("leaveRoom", (room: string) => {
		try {
			socket.leave(room);
			const user = connectedUsers.get(socket.id);
			if (user) {
				const roomMessage: Message = {
					id: Date.now(),
					userId: socket.id,
					username: user.username,
					content: `User ${user.username} left room ${room}`,
					timestamp: new Date(),
					room: room,
				};
				chat.to(room).emit("newMessage", roomMessage);
				wsLogger("leaveRoom", `User ${user.username} left room ${room}`);
			}
		} catch (error) {
			handleError(socket, "leaveRoom", error);
		}
	});

	// Message event for sending messages
	socket.on("message", (data: { content: string; room?: string }) => {
		try {
			const user = connectedUsers.get(socket.id);
			if (!user) throw new Error("User not authenticated");

			// Check if the user has joined a room
			if (!data.room) {
				socket.emit("error", {
					message: "You must join a room before sending messages",
				});
				return;
			}

			const messageData: Message = {
				id: Date.now(),
				userId: socket.id,
				username: user.username,
				content: data.content,
				timestamp: new Date(),
				room: data.room,
			};

			messages.push(messageData);
			wsLogger("message", `Message from ${user.username}: ${data.content}`);
			// Emit message to the specified room if provided, otherwise to all
			if (data.room) {
				chat.to(data.room).emit("newMessage", messageData);
			} else {
				chat.emit("newMessage", messageData);
			}
		} catch (error) {
			handleError(socket, "message", error);
		}
	});

	// Leave event
	socket.on("leave", () => {
		try {
			handleUserDisconnect(socket);
		} catch (error) {
			handleError(socket, "leave", error);
		}
	});

	// Disconnect event
	socket.on("disconnect", () => {
		try {
			wsLogger("disconnect", `Client disconnected - ID: ${socket.id}`);
			handleUserDisconnect(socket);
		} catch (error) {
			handleError(socket, "disconnect", error);
		}
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
