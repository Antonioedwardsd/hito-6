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
	const userListEl = document.getElementById("userListConnected");
	const themeToggle = document.getElementById("themeToggle");

	// Event Listeners
	loginForm.addEventListener("submit", handleLogin);
	createRoomBtn.addEventListener("click", handleCreateRoom);
	messageForm.addEventListener("submit", handleMessageSubmit);
	messageInput.addEventListener("input", handleTyping);
	leaveRoomBtn.addEventListener("click", leaveRoom);
	window.addEventListener("beforeunload", handleUnload);

	roomList.addEventListener("click", (e) => {
		const deleteBtn = e.target.closest(".delete-room-btn");
		if (deleteBtn) {
			e.stopPropagation();
			const roomName = deleteBtn.dataset.room;
			if (activeRoom === roomName) {
				showToast("Debes salir de la sala antes de eliminarla", "error");
				return;
			}
			socket.emit("deleteRoom", roomName);
		} else {
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
	});

	// Toggle dark mode
	themeToggle.addEventListener("click", () => {
		document.body.classList.toggle("dark-mode");
		const icon = themeToggle.querySelector("i");
		if (document.body.classList.contains("dark-mode")) {
			icon.classList.remove("fa-moon");
			icon.classList.add("fa-sun");
		} else {
			icon.classList.remove("fa-sun");
			icon.classList.add("fa-moon");
		}
	});

	// Socket Event Listeners
	socket.on("connect", handleConnect);
	socket.on("disconnect", handleDisconnect);
	socket.on("roomList", updateRoomList);
	socket.on("newMessage", handleNewMessage);
	socket.on("typingUsers", handleTypingUsers);
	socket.on("userList", handleUserList);
	socket.on("userLeftRoom", handleUserLeftRoom);
	socket.on("userJoinedRoom", handleUserJoinedRoom); // Handle join notifications

	// Handle login event
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

	// Handle room creation
	function handleCreateRoom() {
		const roomName = newRoomInput.value.trim();
		if (!roomName) return;
		socket.emit("createRoom", roomName);
		newRoomInput.value = "";
	}

	// Update room list with room-info container for proper icon spacing
	function updateRoomList(rooms) {
		roomList.innerHTML = rooms
			.map(
				(room) => `
      <li class="room-item" data-room="${room}" role="button" aria-label="Join ${room} room">
        <div class="room-info">
          <i class="fa-solid fa-hashtag"></i>
          <span>${room}</span>
        </div>
        <button class="delete-room-btn" data-room="${room}" title="Delete ${room}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </li>
    `
			)
			.join("");
	}

	// Join a room
	function joinRoom(roomName) {
		if (activeRoom === roomName) return;
		activeRoom = roomName;
		currentRoomName.textContent = roomName;
		messageForm.classList.remove("hidden");
		socket.emit("joinRoom", roomName);
		loadMessageHistory(roomName);
		messageInput.focus();

		// Set leaveRoomBtn text to "Leave" when joining a room
		leaveRoomBtn.textContent = "Leave";

		// Update active class in room list
		document.querySelectorAll(".room-item").forEach((item) => {
			item.classList.remove("active");
		});
		const roomItem = document.querySelector(
			`.room-item[data-room="${roomName}"]`
		);
		if (roomItem) {
			roomItem.classList.add("active");
		}
	}

	// Load message history for the room
	function loadMessageHistory(roomName) {
		messagesEl.innerHTML =
			messageHistory.get(roomName)?.map(createMessageElement).join("") || "";
		scrollToBottom();
	}

	// Handle new message event
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

	// Create HTML for a message element
	function createMessageElement(message) {
		const isSelf = message.username === currentUser;
		return `
      <div class="message ${isSelf ? "self" : ""}">
          <header class="message-header">
              <span class="username">${message.username}</span>
              <time class="timestamp">${formatTime(message.timestamp)}</time>
          </header>
          <p class="content">${sanitize(message.content)}</p>
      </div>
    `;
	}

	// Handle message form submission
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

	// Handle typing event
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

	// Handle typing users event
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

	// Handle user list update
	function handleUserList(users) {
		connectedUsers = new Map(users.map((user) => [user.id, user]));
		renderUserList();
	}

	// Render user list in the sidebar
	function renderUserList() {
		if (!userListEl) return;
		userListEl.innerHTML = Array.from(connectedUsers.values())
			.map((user) => `<li class="user-item">${user.username}</li>`)
			.join("");
	}

	// Handle user leaving the room (toast notification)
	function handleUserLeftRoom(data) {
		showToast(`${data.username} left the room`, "info");
	}

	// Handle user joining the room (toast notification)
	function handleUserJoinedRoom(data) {
		showToast(`${data.username} joined the room`, "info");
	}

	// Update character counter for the message input
	function updateCharCounter(remaining) {
		charCounter.textContent = `${remaining}/500`;
		charCounter.style.color = remaining < 50 ? "#e74c3c" : "#7f8c8d";
	}

	// Scroll chat to bottom
	function scrollToBottom() {
		messagesEl.scrollTop = messagesEl.scrollHeight;
	}

	// Sanitize text input
	function sanitize(text) {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

	// Format timestamp to readable time
	function formatTime(timestamp) {
		const options = { hour: "numeric", minute: "2-digit" };
		return new Date(timestamp).toLocaleTimeString([], options);
	}

	// Display a toast notification
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

	// Get icon class based on toast type
	function getToastIcon(type) {
		const icons = {
			error: "fa-exclamation-circle",
			success: "fa-check-circle",
			info: "fa-info-circle",
		};
		return icons[type] || "fa-info-circle";
	}

	// Handle connection established
	function handleConnect() {
		connectionStatus.className = "connected";
		connectionStatus.textContent = "Connected";
	}

	// Handle disconnection
	function handleDisconnect() {
		connectionStatus.className = "disconnected";
		connectionStatus.textContent = "Reconnecting...";
	}

	// Handle window unload (log out)
	function handleUnload() {
		socket.emit("leave", currentUser);
	}

	// Leave the room or log out
	function leaveRoom() {
		if (activeRoom) {
			// Emit leaveRoom event to the server
			socket.emit("leaveRoom", activeRoom);

			// Remove active class from the room item
			const roomItem = document.querySelector(
				`.room-item[data-room="${activeRoom}"]`
			);
			if (roomItem) {
				roomItem.classList.remove("active");
			}

			activeRoom = null;
			currentRoomName.textContent = "Select a Room";
			messageForm.classList.add("hidden");
			messagesEl.innerHTML = "";

			// Change leaveRoomBtn text to "Log Out"
			leaveRoomBtn.textContent = "Log Out";
		} else {
			// If not in any room, log out: hide chat container and show login container
			socket.disconnect();
			chatContainer.classList.add("hidden");
			loginContainer.classList.remove("hidden");
		}
	}
});
