const socket = io();

// Connection handling
socket.on("connect", () => {
	console.log("Connected to the server");

	// Perform login by sending a custom username
	const username = prompt(
		"Enter your username",
		"User" + Math.floor(Math.random() * 1000)
	);
	socket.emit("join", { username });
});

// Listen for the welcome message
socket.on("welcome", (data) => {
	console.log("Welcome message:", data.message);
});

// Display new messages
socket.on("newMessage", (message) => {
	console.log("New message:", message);
	const messagesDiv = document.getElementById("messages");
	messagesDiv.innerHTML += `<p><strong>${message.username}:</strong> ${message.content}</p>`;
});

// Update the online users list
socket.on("userJoined", (data) => {
	updateUserList(data.onlineUsers);
});

socket.on("userLeft", (data) => {
	updateUserList(data.onlineUsers);
});

// Function to send messages
function sendMessage() {
	const input = document.getElementById("messageInput");
	const content = input.value.trim();
	if (content) {
		socket.emit("message", { content });
		input.value = "";
	}
}

// Update the list of users
function updateUserList(users) {
	const userList = document.getElementById("userList");
	userList.innerHTML = "<h3>Online Users:</h3>";
	users.forEach((user) => {
		userList.innerHTML += `<div>${user.username}</div>`;
	});
}

// Handle errors
socket.on("error", (error) => {
	console.error("Server error:", error);
});
