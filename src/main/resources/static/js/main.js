'use strict';

import { resendSavedMessages } from "./message-storage/storageManager";


let usernamePage = document.querySelector('#username-page');
let chatPage = document.querySelector('#chat-page');
let usernameForm = document.querySelector('#usernameForm');
let messageForm = document.querySelector('#messageForm');
let messageInput = document.querySelector('#message');
let messageArea = document.querySelector('#messageArea');
let connectingElement = document.querySelector('.connecting');

let stompClient = null;
let username = null;
let room = null;
let subscription = null;

let colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function initializeApp() {
    username = sessionStorage.getItem("username");
    room = sessionStorage.getItem("room");

    if (username && room) {
        enterRoom(room);
    } else if (username) {
        connectToServer();
    } else {
        showUsernamePage();
    }
}

function connectToServer() {
    let socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, onConnected, onError);
}

function onConnected() {
    console.log('Connected to WebSocket');
    subscribeToRooms();
    showRoomSelectionPage();
}

function subscribeToRooms() {
    stompClient.subscribe('/topic/rooms', (payload) => {
        let data = JSON.parse(payload.body);
        displayRooms(data);
    });

    stompClient.send("/app/chat.getRooms", {}, "");
}

function displayRooms(rooms) {
    let roomList = document.getElementById("room-list");
    roomList.innerHTML = "";

    rooms.forEach(roomName => {
        let li = document.createElement("li");
        li.textContent = roomName;
        li.classList.add("room-item");
        li.onclick = () => enterRoom(roomName);
        roomList.appendChild(li);
    });
}

function enterRoom(roomName) {
    room = roomName;
    sessionStorage.setItem("room", room);
    sessionStorage.setItem("username", username);
    navigateToChatPage();
    joinRoom();
}

function navigateToChatPage() {
    messageArea.innerHTML = "";
    usernamePage.classList.add("hidden");
    document.getElementById("room-page").classList.add("hidden");
    chatPage.classList.remove("hidden");
    if (!stompClient) {
        let socket = new SockJS("/ws");
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnected, onError);
    }
}

function joinRoom() {
    if (subscription) {
        subscription.unsubscribe();
    }

    subscription = stompClient.subscribe('/topic/public/' + room, onMessageReceived);
    stompClient.send("/app/chat.addUser", {}, JSON.stringify({
        sender: username,
        type: "JOIN",
        room: room
    }));
    document.getElementById("room-name-title").innerText = "Room: " + room;
}

function leaveRoom() {
    stompClient.send("/app/chat.leaveUser", {}, JSON.stringify({
        sender: username,
        type: "LEAVE",
        room: room
    }));

    if (subscription) {
        subscription.unsubscribe();
    }

    sessionStorage.removeItem("room");
    room = null;
    navigateToRoomPage();
}

function navigateToRoomPage() {
    chatPage.classList.add("hidden");
    document.getElementById("room-page").classList.remove("hidden");
}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

function sendMessage(event) {
    let messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        let chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT',
            room: room
        };
        stompClient.send("/app/chat.sendMessage/" + room, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function onMessageReceived(payload) {
    let message = JSON.parse(payload.body);
    let messageElement = createMessageElement(message);
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function createMessageElement(message) {
    let messageElement = document.createElement('li');

    console.log("Создаем элемент для сообщения: ", message);

    if (message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = `${message.sender} joined!`;
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = `${message.sender} left!`;
    } else {
        messageElement.classList.add('chat-message');
        messageElement.appendChild(createAvatar(message.sender));
        messageElement.appendChild(createUsernameElement(message.sender));
    }

    let textElement = document.createElement('p');
    textElement.textContent = message.content;
    messageElement.appendChild(textElement);

    return messageElement;
}

function createAvatar(sender) {
    let avatarElement = document.createElement('i');
    avatarElement.textContent = sender[0];
    avatarElement.style['background-color'] = getAvatarColor(sender);
    return avatarElement;
}

function createUsernameElement(sender) {
    let usernameElement = document.createElement('span');
    usernameElement.textContent = sender;
    return usernameElement;
}

function createRoom() {
    let roomName = document.getElementById("new-room-name").value.trim();

    if (roomName && stompClient) {
        stompClient.send("/app/chat.createRoom", {}, roomName);

        document.getElementById("new-room-name").value = '';
    }
}

function getAvatarColor(sender) {
    let hash = 0;
    for (let i = 0; i < sender.length; i++) {
        hash = 31 * hash + sender.charCodeAt(i);
    }
    let index = Math.abs(hash % colors.length);
    return colors[index];
}

function showUsernamePage() {
    usernamePage.classList.remove("hidden");
    document.getElementById("room-page").classList.add("hidden");
}

function showRoomSelectionPage() {
    usernamePage.classList.add("hidden");
    document.getElementById("room-page").classList.remove("hidden");
    if (sessionStorage.getItem("room")) {
        enterRoom(sessionStorage.getItem("room"));
    }
}

usernameForm.addEventListener('submit', function (event) {
    event.preventDefault();
    username = document.querySelector('#name').value.trim();
    if (username) {
        sessionStorage.setItem("username", username);
        connectToServer();
    }
}, true);

window.addEventListener('beforeunload', function () {
    if (stompClient && username && room) {
        stompClient.send("/app/chat.leaveUser", {}, JSON.stringify({
            sender: username,
            type: "LEAVE",
            room: room
        }));
    }
});

messageForm.addEventListener('submit', sendMessage, true);
document.addEventListener('DOMContentLoaded', initializeApp);
