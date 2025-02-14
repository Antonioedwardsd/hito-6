const socket = io("/chat");

let currentRoom = "";

// Connection handling
socket.on("connect", () => {
	console.log("Connected to the server");

	// Login by sending a custom username
	const username = prompt("Enter your username");
	socket.emit("join", { username });
});

// Listen for the welcome message
socket.on("welcome", (data) => {
	console.log("Welcome message:", data.message);
});

// Display new messages
socket.on("newMessage", (message) => {
	console.log("New message:", message);
	const messagesList = document.getElementById("messages");
	const messageItem = document.createElement("li");
	messageItem.textContent = `${message.username}: ${message.content}`;
	messagesList.appendChild(messageItem);
});

// Update the online users
socket.on("userJoined", (data) => {
	updateUserList(data.onlineUsers);
});

socket.on("userLeft", (data) => {
	updateUserList(data.onlineUsers);
});

// Function to send messages
function sendMessage() {
	const input = document.getElementById("messageInput");
	if (!currentRoom) {
		showToast("You must join a room first😉!");
		input.value = "";
		return;
	}
	const content = input.value.trim();
	if (content) {
		socket.emit("message", { content, room: currentRoom });
		input.value = "";
	}
}

// Listen for form submission to send a message
document.getElementById("messageForm").addEventListener("submit", function (e) {
	e.preventDefault();
	sendMessage();
});

// Join a room
function joinRoom(room) {
	currentRoom = room;
	socket.emit("joinRoom", room);
}

// Leave the current room
function leaveRoom() {
	if (currentRoom) {
		socket.emit("leaveRoom", currentRoom);
		currentRoom = "";

		document.getElementById("messages").innerHTML = "";
	}
}

// Update the list of users
function updateUserList(users) {
	const userList = document.getElementById("userList");
	// Clear the current list
	userList.innerHTML = "";

	const title = document.createElement("h3");
	title.textContent = "Online Users:";
	userList.appendChild(title);

	users.forEach((user) => {
		const userItem = document.createElement("div");
		userItem.textContent = user.username;
		userList.appendChild(userItem);
	});
}

function showToast(message, duration = 3000) {
	const container = document.getElementById("notification-container");
	const toast = document.createElement("div");
	toast.className = "toast";
	toast.textContent = message;
	container.appendChild(toast);

	toast.offsetHeight;
	toast.classList.add("show");

	setTimeout(() => {
		toast.classList.remove("show");
		toast.addEventListener("transitionend", () => {
			toast.remove();
		});
	}, duration);
}

// Handle errors
socket.on("error", (error) => {
	console.error("Server error:", error);
});

socket.on("reconnect_attempt", () => {
	console.log("Reconnection attempt...");
});
