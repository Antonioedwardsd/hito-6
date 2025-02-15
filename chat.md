<!-- src\public\index.html -->
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>SocketChat - Real-Time Chat</title>
		<script src="/socket.io/socket.io.js"></script>
		<script src="/app.js" defer></script>
		<link
			rel="stylesheet"
			href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
		/>
		<link rel="stylesheet" href="/styles.css" />
	</head>
	<body>
		<h1>SocketChat <i class="fa-solid fa-comments"></i></h1>
		<div class="main-container">
			<div id="login-container">
				<form id="loginForm">
					<label for="usernameInput" class="sr-only">Username</label>
					<input
						type="text"
						id="usernameInput"
						placeholder="Enter username"
						autofocus
						required
					/>
					<button type="submit" class="submitBtn">Join Chat</button>
				</form>
			</div>

    		<div id="chat-container" class="hidden">
    			<aside id="sidebar">
    				<div class="room-management">
    					<h3><i class="fa-solid fa-door-open"></i> Rooms</h3>
    					<div class="new-room">
    						<input
    							type="text"
    							id="newRoomInput"
    							placeholder="New room name"
    						/>
    						<button id="createRoomBtn" class="iconBtn">
    							<i class="fa-solid fa-plus"></i>
    						</button>
    					</div>
    				</div>
    				<ul id="roomList"></ul>
    			</aside>

    			<section id="chatArea">
    				<header id="chatHeader">
    					<div>
    						<h2 id="currentRoomName">Select a Room</h2>
    						<span id="connectionStatus" class="connected"></span>
    					</div>
    					<button id="leaveRoomBtn" class="submitBtn">
    						<i class="fa-solid fa-arrow-right-from-bracket"></i> Leave
    					</button>
    				</header>

    				<ul id="messages"></ul>

    				<div id="typingIndicator"></div>

    				<form id="messageForm" class="hidden">
    					<div class="input-container">
    						<input
    							type="text"
    							id="messageInput"
    							placeholder="Type your message..."
    							maxlength="500"
    						/>
    						<div id="charCounter">500/500</div>
    					</div>
    					<button type="submit" class="submitBtn">Send</button>
    				</form>
    			</section>
    		</div>

    		<div id="notification-container"></div>
    		<div aria-live="polite" class="sr-only" id="a11y-notifications"></div>
    	</div>
    </body>

</html>

/_ src\public\styles.css _/

/_ Reset and base styles _/
_,
_::before,
\*::after {
box-sizing: border-box;
margin: 0;
padding: 0;
}

:root {
/_ Light theme _/
--color-primary: #f8f9fa;
--color-secondary: #2c3e50;
--color-accent: #3498db;
--color-success: #27ae60;
--color-error: #e74c3c;
--text-primary: #2c3e50;
--text-secondary: #ffffff;

    /* Spacing */
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;

    /* Border */
    --border-radius: 8px;
    --border: 1px solid #dfe6e9;

    /* Shadows */
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

}

/_ Dark theme _/
@media (prefers-color-scheme: dark) {
:root {
--color-primary: #2c3e50;
--color-secondary: #34495e;
--text-primary: #ecf0f1;
}
}

body {
font-family: "Poppins", sans-serif;
line-height: 1.6;
background: var(--color-primary);
color: var(--text-primary);
padding: var(--spacing-md);
}

/_ Utility classes _/
.hidden {
display: none !important;
}
.sr-only {
position: absolute;
width: 1px;
height: 1px;
padding: 0;
margin: -1px;
overflow: hidden;
}

/_ Login container _/
#login-container {
max-width: 400px;
margin: 2rem auto;
}

#loginForm {
display: flex;
flex-direction: column;
gap: var(--spacing-md);
}

/_ Chat container _/
#chat-container {
display: grid;
grid-template-columns: 250px 1fr;
gap: var(--spacing-md);
max-width: 1200px;
margin: 0 auto;
height: 80vh;
}

#sidebar {
display: flex;
flex-direction: column;
gap: var(--spacing-md);
padding: var(--spacing-md);
background: var(--color-secondary);
color: var(--text-secondary);
border-radius: var(--border-radius);
}

.room-management {
display: flex;
flex-direction: column;
gap: var(--spacing-sm);
}

.new-room {
display: flex;
gap: var(--spacing-sm);
}

#roomList {
list-style: none;
overflow-y: auto;
flex-grow: 1;
}

.room-item {
padding: var(--spacing-sm);
border-radius: var(--border-radius);
cursor: pointer;
transition: background 0.2s;
}

.room-item:hover {
background: rgba(255, 255, 255, 0.1);
}

.room-item.active {
background: var(--color-accent);
font-weight: bold;
}

/_ Chat area _/
#chatArea {
display: flex;
flex-direction: column;
gap: var(--spacing-md);
background: #fff;
padding: var(--spacing-md);
border-radius: var(--border-radius);
box-shadow: var(--shadow-md);
}

#chatHeader {
display: flex;
justify-content: space-between;
padding: var(--spacing-md);
background: var(--color-primary);
border-radius: var(--border-radius);
margin-bottom: var(--spacing-md);
}

#messages {
flex-grow: 1;
overflow-y: auto;
padding: var(--spacing-md);
display: flex;
flex-direction: column;
gap: var(--spacing-sm);
scroll-behavior: smooth;
}

.message {
max-width: 80%;
padding: var(--spacing-sm);
border-radius: var(--border-radius);
background: #fff;
animation: messageIn 0.3s ease;
}

.message:hover {
transform: translateX(5px);
}

.message-header {
display: flex;
align-items: baseline;
gap: var(--spacing-sm);
margin-bottom: 0.3rem;
}

.username {
font-weight: 600;
font-size: 0.9rem;
}

.message.self {
align-self: flex-end;
background: var(--color-accent);
color: white;
}

.timestamp {
font-size: 0.75rem;
opacity: 0.8;
}

.content {
word-break: break-word;
line-height: 1.4;
}

@keyframes messageIn {
from {
opacity: 0;
transform: translateY(10px);
}
to {
opacity: 1;
transform: translateY(0);
}
}

/_ Typing indicator _/
#typingIndicator {
min-height: 20px;
font-style: italic;
color: #7f8c8d;
}

/_ Message form _/
#messageForm {
display: flex;
gap: var(--spacing-sm);
padding-top: var(--spacing-md);
border-top: var(--border);
}

#messageInput {
padding: var(--spacing-sm) var(--spacing-md);
border: 2px solid var(--color-secondary);
border-radius: var(--border-radius);
transition: all 0.3s ease;
}

#messageInput:focus {
border-color: var(--color-accent);
box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

#newRoomInput {
padding: var(--spacing-sm);
border: 2px solid var(--color-secondary);
border-radius: var(--border-radius);
transition: all 0.3s ease;
}

.submitBtn {
color: white;
background: var(--color-accent);
padding: var(--spacing-sm) var(--spacing-md);
border-radius: var(--border-radius);
transition: all 0.3s ease;
}

.submitBtn:hover {
background: var(--color-secondary);
color: white;
transform: translateY(-1px);
}

#createRoomBtn {
color: white;
font-size: 1rem;
background: var(--color-accent);
border: none;
border-radius: var(--border-radius);
padding: var(--spacing-sm) var(--spacing-sm);
transition: all 0.3s ease;
}

#leaveRoomBtn {
color: white;
font-size: 1.5rem;
background: transparent;
border: none;
padding: var(--spacing-sm) var(--spacing-md);
transition: all 0.3s ease;
}

#leaveRoomBtn:hover {
background-color: rgba(231, 76, 60, 0.1);
color: #e74c3c;
border-radius: var(--border-radius);
}

#usernameInput {
padding: var(--spacing-sm);
border: 2px solid var(--color-secondary);
border-radius: var(--border-radius);
transition: all 0.3s ease;
}

.input-container {
flex-grow: 1;
position: relative;
}

#charCounter {
position: absolute;
right: var(--spacing-sm);
bottom: var(--spacing-sm);
font-size: 0.8rem;
color: #7f8c8d;
}

/_ Notifications _/
#notification-container {
position: fixed;
top: var(--spacing-md);
right: var(--spacing-md);
display: flex;
flex-direction: column;
gap: var(--spacing-sm);
}

.toast {
padding: var(--spacing-sm) var(--spacing-md);
border-radius: var(--border-radius);
display: flex;
align-items: center;
gap: var(--spacing-sm);
animation: toastIn 0.3s ease;
}

.toast.success {
background: var(--color-success);
color: white;
}
.toast.error {
background: var(--color-error);
color: white;
}
.toast.info {
background: var(--color-secondary);
color: white;
}

@keyframes toastIn {
from {
transform: translateX(100%);
}
to {
transform: translateX(0);
}
}

/_ Connection status _/
#connectionStatus::before {
content: "";
display: inline-block;
width: 10px;
height: 10px;
border-radius: 50%;
margin-right: 0.5rem;
}

#connectionStatus.connected::before {
background: var(--color-success);
}
#connectionStatus.disconnected::before {
background: var(--color-error);
}

@media (prefers-color-scheme: dark) {
#chatArea {
background: var(--color-secondary);
}

    .message {
    	background: rgba(255, 255, 255, 0.1);
    }

    .message.self {
    	background: var(--color-accent);
    }

    #messageInput {
    	background: #fff;
    	color: rgba(255, 255, 255, 0.1);
    }

}

// src\public\app.js
document.addEventListener("DOMContentLoaded", () => {
const socket = io("/chat");
let currentUser = null;
let activeRoom = null;
const messageHistory = new Map();
let isTyping = false;
let typingTimeout = null;

    let connectedUsers = new Map();

    // DOM Elements
    const loginContainer = document.getElementById("login-container");
    const chatContainer = document.getElementById("chat-container");
    const usernameInput = document.getElementById("usernameInput");
    const loginForm = document.getElementById("loginForm");
    const roomList = document.getElementById("roomList");
    const newRoomInput = document.getElementById("newRoomInput");
    const createRoomBtn = document.getElementById("createRoomBtn");
    const messageForm = document.getElementById("messageForm");
    const messageInput = document.getElementById("messageInput");
    const messagesEl = document.getElementById("messages");
    const charCounter = document.getElementById("charCounter");
    const typingIndicator = document.getElementById("typingIndicator");
    const currentRoomName = document.getElementById("currentRoomName");
    const leaveRoomBtn = document.getElementById("leaveRoomBtn");
    const connectionStatus = document.getElementById("connectionStatus");

    // Event Listeners
    loginForm.addEventListener("submit", handleLogin);
    createRoomBtn.addEventListener("click", handleCreateRoom);
    messageForm.addEventListener("submit", handleMessageSubmit);
    messageInput.addEventListener("input", handleTyping);
    leaveRoomBtn.addEventListener("click", leaveRoom);
    window.addEventListener("beforeunload", handleUnload);
    roomList.addEventListener("click", handleRoomClick);

    // Socket Events
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("roomList", updateRoomList);
    socket.on("newMessage", handleNewMessage);
    socket.on("typingUsers", handleTypingUsers);
    socket.on("userList", handleUserList);
    socket.on("userLeftRoom", handleUserLeftRoom);

    function handleLogin(e) {
    	e.preventDefault();
    	const username = usernameInput.value.trim();
    	if (username.length < 3 || username.length > 20) {
    		showToast("Username must be between 3-20 characters", "error");
    		return;
    	}
    	currentUser = username;
    	socket.emit("join", { username });
    	loginContainer.classList.add("hidden");
    	chatContainer.classList.remove("hidden");
    }

    function handleCreateRoom() {
    	const roomName = newRoomInput.value.trim();
    	if (!roomName) return;
    	socket.emit("createRoom", roomName);
    	newRoomInput.value = "";
    }

    function handleRoomClick(e) {
    	const roomItem = e.target.closest(".room-item");
    	if (roomItem) {
    		const roomName = roomItem.dataset.room;
    		joinRoom(roomName);
    		document.querySelectorAll(".room-item").forEach((item) => {
    			item.classList.remove("active");
    		});
    		roomItem.classList.add("active");
    	}
    }

    function updateRoomList(rooms) {
    	roomList.innerHTML = rooms
    		.map(
    			(room) => `
          <li class="room-item"
              data-room="${room}"
              role="button"
              aria-label="Join ${room} room">
              <i class="fa-solid fa-hashtag"></i>
              ${room}
          </li>
      `
    		)
    		.join("");
    }

    function joinRoom(roomName) {
    	if (activeRoom === roomName) return;
    	activeRoom = roomName;
    	currentRoomName.textContent = roomName;
    	messageForm.classList.remove("hidden");
    	socket.emit("joinRoom", roomName);
    	loadMessageHistory(roomName);
    	messageInput.focus();
    }

    function loadMessageHistory(roomName) {
    	messagesEl.innerHTML =
    		messageHistory.get(roomName)?.map(createMessageElement).join("") || "";
    	scrollToBottom();
    }

    function handleNewMessage(message) {
    	if (!messageHistory.has(message.room)) {
    		messageHistory.set(message.room, []);
    	}
    	messageHistory.get(message.room).push(message);
    	if (message.room === activeRoom) {
    		messagesEl.insertAdjacentHTML("beforeend", createMessageElement(message));
    		scrollToBottom();
    	}
    }

    function createMessageElement(message) {
    	const isSelf = message.username === currentUser;
    	return `
          <div class="message ${isSelf ? "self" : ""}">
              <header class="message-header">
                  <span class="username">${message.username}</span>
                  <time class="timestamp">${formatTime(
    									message.timestamp
    								)}</time>
              </header>
              <p class="content">${sanitize(message.content)}</p>
          </div>
      `;
    }

    function handleMessageSubmit(e) {
    	e.preventDefault();
    	const content = messageInput.value.trim();
    	if (!content || !activeRoom) return;

    	const message = {
    		content: sanitize(content),
    		room: activeRoom,
    		username: currentUser,
    		timestamp: Date.now(),
    	};

    	socket.emit("message", message);
    	messageInput.value = "";
    	updateCharCounter(500);
    }

    function handleTyping() {
    	if (!isTyping) {
    		isTyping = true;
    		socket.emit("typing", activeRoom);
    	}
    	clearTimeout(typingTimeout);
    	typingTimeout = setTimeout(() => {
    		isTyping = false;
    		socket.emit("stopTyping", activeRoom);
    	}, 1000);
    	updateCharCounter(500 - this.value.length);
    }

    function handleTypingUsers(userIds) {
    	const typingUsers = Array.from(connectedUsers.values())
    		.filter((user) => userIds.includes(user.id))
    		.map((user) => user.username);

    	typingIndicator.textContent =
    		typingUsers.length > 0
    			? `${typingUsers.join(", ")} ${
    					typingUsers.length > 1 ? "are" : "is"
    			  } typing...`
    			: "";
    }

    function handleUserList(users) {
    	connectedUsers = new Map(users.map((user) => [user.id, user]));
    }

    function handleUserLeftRoom(data) {
    	showToast(`${data.username} left the room`, "info");
    }

    function updateCharCounter(remaining) {
    	charCounter.textContent = `${remaining}/500`;
    	charCounter.style.color = remaining < 50 ? "#e74c3c" : "#7f8c8d";
    }

    function scrollToBottom() {
    	messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function sanitize(text) {
    	const div = document.createElement("div");
    	div.textContent = text;
    	return div.innerHTML;
    }

    function formatTime(timestamp) {
    	const options = { hour: "numeric", minute: "2-digit" };
    	return new Date(timestamp).toLocaleTimeString([], options);
    }

    function showToast(message, type = "info", duration = 3000) {
    	const toast = document.createElement("div");
    	toast.className = `toast ${type}`;
    	toast.innerHTML = `
          <i class="fas ${getToastIcon(type)}"></i>
          <span>${message}</span>
      `;
    	document.getElementById("notification-container").appendChild(toast);
    	setTimeout(() => toast.remove(), duration);
    }

    function getToastIcon(type) {
    	const icons = {
    		error: "fa-exclamation-circle",
    		success: "fa-check-circle",
    		info: "fa-info-circle",
    	};
    	return icons[type] || "fa-info-circle";
    }

    function handleConnect() {
    	connectionStatus.className = "connected";
    	connectionStatus.textContent = "Connected";
    }

    function handleDisconnect() {
    	connectionStatus.className = "disconnected";
    	connectionStatus.textContent = "Reconnecting...";
    }

    function handleUnload() {
    	socket.emit("leave", currentUser);
    }

    function leaveRoom() {
    	if (activeRoom) {
    		socket.emit("leaveRoom", activeRoom);
    		activeRoom = null;
    		currentRoomName.textContent = "Select a Room";
    		messageForm.classList.add("hidden");
    		messagesEl.innerHTML = "";
    	}
    }

});

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
origin: "\*",
methods: ["GET", "POST"],
},
});

// Express middlewares and static files
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.static(path.join(\_\_dirname, "public")));

app.get("/", (req: Request, res: Response) => {
res.sendFile(path.join(\_\_dirname, "public", "index.html"));
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

// package.json

{
"name": "hito-6",
"version": "1.0.0",
"main": "index.js",
"scripts": {
"dev": "tsx --watch src/index.ts"
},
"keywords": [],
"author": "",
"license": "ISC",
"type": "commonjs",
"description": "",
"dependencies": {
"cookie-parser": "^1.4.7",
"express": "^4.21.2",
"morgan": "^1.10.0",
"socket.io": "^4.8.1",
"tsx": "^4.19.2"
},
"devDependencies": {
"@types/cookie-parser": "^1.4.8",
"@types/express": "^5.0.0",
"@types/morgan": "^1.9.9",
"@types/node": "^22.13.4",
"ts-node": "^10.9.2",
"typescript": "^5.7.3"
}
}

// tsconfig.json

{
"compilerOptions": {
/_ Visit https://aka.ms/tsconfig to read more about this file _/

    /* Projects */
    // "incremental": true,                              /* Save .tsbuildinfo files to allow for incremental compilation of projects. */
    // "composite": true,                                /* Enable constraints that allow a TypeScript project to be used with project references. */
    // "tsBuildInfoFile": "./.tsbuildinfo",              /* Specify the path to .tsbuildinfo incremental compilation file. */
    // "disableSourceOfProjectReferenceRedirect": true,  /* Disable preferring source files instead of declaration files when referencing composite projects. */
    // "disableSolutionSearching": true,                 /* Opt a project out of multi-project reference checking when editing. */
    // "disableReferencedProjectLoad": true,             /* Reduce the number of projects loaded automatically by TypeScript. */

    /* Language and Environment */
    "target": "es2016",                                  /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    // "lib": [],                                        /* Specify a set of bundled library declaration files that describe the target runtime environment. */
    // "jsx": "preserve",                                /* Specify what JSX code is generated. */
    // "experimentalDecorators": true,                   /* Enable experimental support for legacy experimental decorators. */
    // "emitDecoratorMetadata": true,                    /* Emit design-type metadata for decorated declarations in source files. */
    // "jsxFactory": "",                                 /* Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h'. */
    // "jsxFragmentFactory": "",                         /* Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'. */
    // "jsxImportSource": "",                            /* Specify module specifier used to import the JSX factory functions when using 'jsx: react-jsx*'. */
    // "reactNamespace": "",                             /* Specify the object invoked for 'createElement'. This only applies when targeting 'react' JSX emit. */
    // "noLib": true,                                    /* Disable including any library files, including the default lib.d.ts. */
    // "useDefineForClassFields": true,                  /* Emit ECMAScript-standard-compliant class fields. */
    // "moduleDetection": "auto",                        /* Control what method is used to detect module-format JS files. */

    /* Modules */
    "module": "commonjs",                                /* Specify what module code is generated. */
    // "rootDir": "./",                                  /* Specify the root folder within your source files. */
    // "moduleResolution": "node10",                     /* Specify how TypeScript looks up a file from a given module specifier. */
    // "baseUrl": "./",                                  /* Specify the base directory to resolve non-relative module names. */
    // "paths": {},                                      /* Specify a set of entries that re-map imports to additional lookup locations. */
    // "rootDirs": [],                                   /* Allow multiple folders to be treated as one when resolving modules. */
    // "typeRoots": [],                                  /* Specify multiple folders that act like './node_modules/@types'. */
    // "types": [],                                      /* Specify type package names to be included without being referenced in a source file. */
    // "allowUmdGlobalAccess": true,                     /* Allow accessing UMD globals from modules. */
    // "moduleSuffixes": [],                             /* List of file name suffixes to search when resolving a module. */
    // "allowImportingTsExtensions": true,               /* Allow imports to include TypeScript file extensions. Requires '--moduleResolution bundler' and either '--noEmit' or '--emitDeclarationOnly' to be set. */
    // "rewriteRelativeImportExtensions": true,          /* Rewrite '.ts', '.tsx', '.mts', and '.cts' file extensions in relative import paths to their JavaScript equivalent in output files. */
    // "resolvePackageJsonExports": true,                /* Use the package.json 'exports' field when resolving package imports. */
    // "resolvePackageJsonImports": true,                /* Use the package.json 'imports' field when resolving imports. */
    // "customConditions": [],                           /* Conditions to set in addition to the resolver-specific defaults when resolving imports. */
    // "noUncheckedSideEffectImports": true,             /* Check side effect imports. */
    // "resolveJsonModule": true,                        /* Enable importing .json files. */
    // "allowArbitraryExtensions": true,                 /* Enable importing files with any extension, provided a declaration file is present. */
    // "noResolve": true,                                /* Disallow 'import's, 'require's or '<reference>'s from expanding the number of files TypeScript should add to a project. */

    /* JavaScript Support */
    // "allowJs": true,                                  /* Allow JavaScript files to be a part of your program. Use the 'checkJS' option to get errors from these files. */
    // "checkJs": true,                                  /* Enable error reporting in type-checked JavaScript files. */
    // "maxNodeModuleJsDepth": 1,                        /* Specify the maximum folder depth used for checking JavaScript files from 'node_modules'. Only applicable with 'allowJs'. */

    /* Emit */
    // "declaration": true,                              /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
    // "declarationMap": true,                           /* Create sourcemaps for d.ts files. */
    // "emitDeclarationOnly": true,                      /* Only output d.ts files and not JavaScript files. */
    // "sourceMap": true,                                /* Create source map files for emitted JavaScript files. */
    // "inlineSourceMap": true,                          /* Include sourcemap files inside the emitted JavaScript. */
    // "noEmit": true,                                   /* Disable emitting files from a compilation. */
    // "outFile": "./",                                  /* Specify a file that bundles all outputs into one JavaScript file. If 'declaration' is true, also designates a file that bundles all .d.ts output. */
    // "outDir": "./",                                   /* Specify an output folder for all emitted files. */
    // "removeComments": true,                           /* Disable emitting comments. */
    // "importHelpers": true,                            /* Allow importing helper functions from tslib once per project, instead of including them per-file. */
    // "downlevelIteration": true,                       /* Emit more compliant, but verbose and less performant JavaScript for iteration. */
    // "sourceRoot": "",                                 /* Specify the root path for debuggers to find the reference source code. */
    // "mapRoot": "",                                    /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSources": true,                            /* Include source code in the sourcemaps inside the emitted JavaScript. */
    // "emitBOM": true,                                  /* Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. */
    // "newLine": "crlf",                                /* Set the newline character for emitting files. */
    // "stripInternal": true,                            /* Disable emitting declarations that have '@internal' in their JSDoc comments. */
    // "noEmitHelpers": true,                            /* Disable generating custom helper functions like '__extends' in compiled output. */
    // "noEmitOnError": true,                            /* Disable emitting files if any type checking errors are reported. */
    // "preserveConstEnums": true,                       /* Disable erasing 'const enum' declarations in generated code. */
    // "declarationDir": "./",                           /* Specify the output directory for generated declaration files. */

    /* Interop Constraints */
    // "isolatedModules": true,                          /* Ensure that each file can be safely transpiled without relying on other imports. */
    // "verbatimModuleSyntax": true,                     /* Do not transform or elide any imports or exports not marked as type-only, ensuring they are written in the output file's format based on the 'module' setting. */
    // "isolatedDeclarations": true,                     /* Require sufficient annotation on exports so other tools can trivially generate declaration files. */
    // "allowSyntheticDefaultImports": true,             /* Allow 'import x from y' when a module doesn't have a default export. */
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    // "preserveSymlinks": true,                         /* Disable resolving symlinks to their realpath. This correlates to the same flag in node. */
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */

    /* Type Checking */
    "strict": true,                                      /* Enable all strict type-checking options. */
    // "noImplicitAny": true,                            /* Enable error reporting for expressions and declarations with an implied 'any' type. */
    // "strictNullChecks": true,                         /* When type checking, take into account 'null' and 'undefined'. */
    // "strictFunctionTypes": true,                      /* When assigning functions, check to ensure parameters and the return values are subtype-compatible. */
    // "strictBindCallApply": true,                      /* Check that the arguments for 'bind', 'call', and 'apply' methods match the original function. */
    // "strictPropertyInitialization": true,             /* Check for class properties that are declared but not set in the constructor. */
    // "strictBuiltinIteratorReturn": true,              /* Built-in iterators are instantiated with a 'TReturn' type of 'undefined' instead of 'any'. */
    // "noImplicitThis": true,                           /* Enable error reporting when 'this' is given the type 'any'. */
    // "useUnknownInCatchVariables": true,               /* Default catch clause variables as 'unknown' instead of 'any'. */
    // "alwaysStrict": true,                             /* Ensure 'use strict' is always emitted. */
    // "noUnusedLocals": true,                           /* Enable error reporting when local variables aren't read. */
    // "noUnusedParameters": true,                       /* Raise an error when a function parameter isn't read. */
    // "exactOptionalPropertyTypes": true,               /* Interpret optional property types as written, rather than adding 'undefined'. */
    // "noImplicitReturns": true,                        /* Enable error reporting for codepaths that do not explicitly return in a function. */
    // "noFallthroughCasesInSwitch": true,               /* Enable error reporting for fallthrough cases in switch statements. */
    // "noUncheckedIndexedAccess": true,                 /* Add 'undefined' to a type when accessed using an index. */
    // "noImplicitOverride": true,                       /* Ensure overriding members in derived classes are marked with an override modifier. */
    // "noPropertyAccessFromIndexSignature": true,       /* Enforces using indexed accessors for keys declared using an indexed type. */
    // "allowUnusedLabels": true,                        /* Disable error reporting for unused labels. */
    // "allowUnreachableCode": true,                     /* Disable error reporting for unreachable code. */

    /* Completeness */
    // "skipDefaultLibCheck": true,                      /* Skip type checking .d.ts files that are included with TypeScript. */
    "skipLibCheck": true                                 /* Skip type checking all .d.ts files. */

}
}
