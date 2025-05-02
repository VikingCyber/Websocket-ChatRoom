'use strict';

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

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if (username) {

        let socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

document.addEventListener('DOMContentLoaded', function () {
    username = localStorage.getItem("username");
    room = localStorage.getItem("room");

    if (username && room) {
        enterRoom(room);
    } else if (username) {
        onConnected()
    } else {
        usernamePage.classList.remove("hidden");
        document.getElementById("room-page").classList.add("hidden");
    }
});

function createRoom() {
    let roomName = document.getElementById("new-room-name").value.trim();

    if (roomName && stompClient) {
        stompClient.send("/app/chat.createRoom", {}, roomName);

        document.getElementById("new-room-name").value = '';
    }
}


function enterRoom(roomName) {
    room = roomName;
    localStorage.setItem("room", room);
    localStorage.setItem("username", username);
    document.getElementById("room-page").classList.add("hidden");
    chatPage.classList.remove("hidden");

    messageArea.innerHTML = "";

    if (subscription) {
        subscription.unsubscribe();
        console.log("Old subscription is removed.");
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

    localStorage.removeItem("room");
    room = null;

    chatPage.classList.add("hidden");
    document.getElementById("room-page").classList.remove("hidden");
}

function onConnected() {
    stompClient.subscribe('/topic/rooms', function (payload) {
        let data = JSON.parse(payload.body);

        let roomList = document.getElementById("room-list");
        roomList.innerHTML = "";

        for (let roomName of data) {
            let li = document.createElement("li");
            li.textContent = roomName;
            li.classList.add("room-item");
            li.onclick = () => enterRoom(roomName);
            roomList.appendChild(li);
        }

        // Показываем страницу комнат и скрываем страницу с именем пользователя
        usernamePage.classList.add("hidden");
        document.getElementById("room-page").classList.remove("hidden");

        let savedRoom = localStorage.getItem("room");
        if (savedRoom) {
            enterRoom(savedRoom);
        }
    });

    stompClient.send("/app/chat.getRooms", {}, "");

    connectingElement.classList.add("hidden");
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
        localStorage.removeItem("room");

        if (subscription) {
            subscription.unsubscribe();
            subscription = null;
        }
    }
    console.log("Disconnected");
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
            content: messageInput.value,
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

    let messageElement = document.createElement('li');

    if (message.type === 'JOIN') {
        console.log("Processing JOIN event");
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        console.log("Processing LEAVE event");
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        console.log("Processing CHAT message");
        messageElement.classList.add('chat-message');

        let avatarElement = document.createElement('i');
        let avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        let usernameElement = document.createElement('span');
        let usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    let textElement = document.createElement('p');
    let messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    let hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    let index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)