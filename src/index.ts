// src/index.ts
import express, { Request, Response } from "express";
import http from "node:http";
import { Server, Socket } from "socket.io";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

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
	id: string;
	userId: string;
	username: string;
	content: string;
	timestamp: Date;
	room: string;
}

interface User {
	id: string;
	username: string;
	joinedAt: Date;
	lastActive: Date;
	rooms: Set<string>;
}

interface Room {
	name: string;
	users: Map<string, User>;
	messages: Message[];
	typingUsers: Set<string>;
}

// Global data structures
const connectedUsers = new Map<string, User>();
const rooms = new Map<string, Room>();
const MESSAGE_HISTORY_LIMIT = 100;

// Logger function for WebSocket events
const wsLogger = (event: string, ...args: any[]) => {
	console.log(`[WebSocket][${new Date().toISOString()}] ${event}:`, ...args);
};

// Room management
function createRoom(name: string): Room {
	const room: Room = {
		name,
		users: new Map(),
		messages: [],
		typingUsers: new Set(),
	};
	rooms.set(name, room);
	return room;
}

function getOrCreateRoom(name: string): Room {
	return rooms.get(name) || createRoom(name);
}

// Handle user disconnection
function handleUserDisconnect(socket: Socket) {
	const user = connectedUsers.get(socket.id);
	if (user) {
		user.rooms.forEach((roomName) => {
			const room = rooms.get(roomName);
			if (room) {
				room.users.delete(socket.id);
				room.typingUsers.delete(socket.id);
				chat.to(roomName).emit("userLeftRoom", {
					userId: user.id,
					username: user.username,
				});
			}
		});

		connectedUsers.delete(socket.id);
		chat.emit(
			"userList",
			Array.from(connectedUsers.values()).map((user) => ({
				id: user.id,
				username: user.username,
				joinedAt: user.joinedAt,
				lastActive: user.lastActive,
			}))
		);
		wsLogger("leave", `User ${user.username} left the chat`);
	}
}

// Handle errors
function handleError(socket: Socket, event: string, error: any) {
	console.error(`[ERROR][${event}]`, error);
	socket.emit("error", {
		event,
		message: error.message || "An error occurred on the server",
		timestamp: new Date(),
	});
}

// Socket.IO connection for the /chat namespace
chat.on("connection", (socket: Socket) => {
	console.log(`Client connected to /chat, ID: ${socket.id}`);

	// Initial setup
	socket.emit("welcome", {
		message: "Welcome to SocketChat",
		serverTime: new Date().toISOString(),
	});

	// Join event
	socket.on("join", (userData: { username: string }) => {
		try {
			if (!userData.username || userData.username.length < 3) {
				throw new Error("Username must be at least 3 characters");
			}

			const user: User = {
				id: socket.id,
				username: userData.username.trim(),
				joinedAt: new Date(),
				lastActive: new Date(),
				rooms: new Set(),
			};

			connectedUsers.set(socket.id, user);
			chat.emit("userList", Array.from(connectedUsers.values()));
			socket.emit("roomList", Array.from(rooms.keys()));

			wsLogger("join", `User ${userData.username} joined`);
		} catch (error) {
			handleError(socket, "join", error);
		}
	});

	// Room management events
	socket.on("createRoom", (roomName: string) => {
		try {
			if (!roomName || roomName.length < 3) {
				throw new Error("Room name must be at least 3 characters");
			}

			if (rooms.has(roomName)) {
				throw new Error("Room already exists");
			}

			const room = createRoom(roomName);
			chat.emit("roomList", Array.from(rooms.keys()));
			wsLogger("createRoom", `Room ${roomName} created`);
		} catch (error) {
			handleError(socket, "createRoom", error);
		}
	});

	socket.on("joinRoom", (roomName: string) => {
		try {
			const user = connectedUsers.get(socket.id);
			if (!user) throw new Error("User not authenticated");

			const room = getOrCreateRoom(roomName);

			// Leave previous rooms
			user.rooms.forEach((existingRoom) => {
				socket.leave(existingRoom);
				room.users.delete(user.id);
			});
			user.rooms.clear();

			// Join new room
			user.rooms.add(roomName);
			room.users.set(user.id, user);
			socket.join(roomName);

			// Send room history
			socket.emit(
				"messageHistory",
				room.messages.slice(-MESSAGE_HISTORY_LIMIT)
			);

			// Notify room
			const joinMessage: Message = {
				id: Date.now().toString(),
				userId: "system",
				username: "System",
				content: `${user.username} joined the room`,
				timestamp: new Date(),
				room: roomName,
			};

			room.messages.push(joinMessage);
			chat.to(roomName).emit("newMessage", joinMessage);
			wsLogger("joinRoom", `User ${user.username} joined ${roomName}`);
		} catch (error) {
			handleError(socket, "joinRoom", error);
		}
	});

	// Message handling
	socket.on("message", (data: { content: string; room: string }) => {
		try {
			const user = connectedUsers.get(socket.id);
			if (!user) throw new Error("User not authenticated");
			if (!data.room) throw new Error("Room not specified");

			const room = rooms.get(data.room);
			if (!room) throw new Error("Room does not exist");

			const message: Message = {
				id: Date.now().toString(),
				userId: user.id,
				username: user.username,
				content: data.content.substring(0, 500),
				timestamp: new Date(),
				room: data.room,
			};

			// Store message and maintain history limit
			room.messages.push(message);
			if (room.messages.length > MESSAGE_HISTORY_LIMIT) {
				room.messages.shift();
			}

			chat.to(data.room).emit("newMessage", message);
			wsLogger("message", `Message from ${user.username} in ${data.room}`);
		} catch (error) {
			handleError(socket, "message", error);
		}
	});

	// Typing indicators
	socket.on("typing", (roomName: string) => {
		try {
			const user = connectedUsers.get(socket.id);
			const room = rooms.get(roomName);

			if (user && room) {
				room.typingUsers.add(user.id);
				chat.to(roomName).emit("typingUsers", Array.from(room.typingUsers));
			}
		} catch (error) {
			handleError(socket, "typing", error);
		}
	});

	socket.on("stopTyping", (roomName: string) => {
		try {
			const user = connectedUsers.get(socket.id);
			const room = rooms.get(roomName);

			if (user && room) {
				room.typingUsers.delete(user.id);
				chat.to(roomName).emit("typingUsers", Array.from(room.typingUsers));
			}
		} catch (error) {
			handleError(socket, "stopTyping", error);
		}
	});

	// Disconnect handler
	socket.on("disconnect", () => {
		try {
			handleUserDisconnect(socket);
			wsLogger("disconnect", `Client disconnected - ID: ${socket.id}`);
		} catch (error) {
			handleError(socket, "disconnect", error);
		}
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
