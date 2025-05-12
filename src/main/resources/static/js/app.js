'use strict';

import { handlePushToggleChange, initNotifications } from "./notificationSettings.js/notifications.js";
import { createRoom, enterRoom, leaveRoom } from "./room/roomController.js";
import { appState } from "./state/appState.js";
import { createRoomButton, leaveRoomButton, messageForm, messageInput, nameInput, pushToggle, usernameForm } from "./ui/domElements.js";
import { navigateToRoomPage, showUsernamePage } from "./ui/ui.js";
import { connectToServer, sendMessage } from "./websocket/websocket.js";

function initializeApp() {
  if (appState.username && appState.room) {
    enterRoom(appState.room);
  } else if (appState.username) {
    navigateToRoomPage();
  } else {
    showUsernamePage();
  }
  initNotifications();
}

// Listeners
document.addEventListener('DOMContentLoaded', initializeApp);

messageForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const messageContent = messageInput.value.trim();
  if (messageContent && appState.room && appState.username) {
    const message = {
      sender: appState.username,
      content: messageContent,
      room: appState.room,
      type: "CHAT"
    };

    sendMessage(`/app/chat.sendMessage/${appState.room}`, message);
    messageInput.value = "";
  } else {
    console.error("Необходимо указать текст сообщения, комнату и имя пользователя!");
  }
});

usernameForm.addEventListener('submit', function (event) {
  event.preventDefault();
  appState.username = nameInput.value.trim();
  if (appState.username) {
    sessionStorage.setItem("username", appState.username);
    connectToServer();
  }
});

pushToggle.addEventListener("change", handlePushToggleChange);
createRoomButton.addEventListener("click", createRoom)
leaveRoomButton.addEventListener("click", leaveRoom)

window.addEventListener('beforeunload', function () {
  if (appState.stompClient && appState.username && appState.room) {
    appState.stompClient.send("/app/chat.leaveUser", {}, JSON.stringify({
      sender: appState.username,
      type: "LEAVE",
      room: appState.room
    }));
  }
});