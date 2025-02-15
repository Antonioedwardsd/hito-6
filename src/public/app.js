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
