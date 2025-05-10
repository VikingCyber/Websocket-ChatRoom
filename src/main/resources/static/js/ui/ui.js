'use strict';

import { appState } from '../state/appState.js';
import { connectToServer } from '../websocket/websocket.js';
import { chatPage, messageArea, usernamePage } from './domElements.js';

export function navigateToChatPage() {
  messageArea.innerHTML = "";
  usernamePage.classList.add("hidden");
  document.getElementById("room-page").classList.add("hidden");
  chatPage.classList.remove("hidden");
  if (!appState.stompClient) {
    connectToServer();
  }
}

export function navigateToRoomPage() {
  chatPage.classList.add("hidden");
  document.getElementById("room-page").classList.remove("hidden");
}

export function showUsernamePage() {
  usernamePage.classList.remove("hidden");
  document.getElementById("room-page").classList.add("hidden");
}

export function showRoomSelectionPage() {
  usernamePage.classList.add("hidden");
  document.getElementById("room-page").classList.remove("hidden");
}

export function displayRooms(rooms, onRoomClick) {
  let roomList = document.getElementById("room-list");
  roomList.innerHTML = "";
  rooms.forEach(roomName => {
    const li = document.createElement("li");
    li.textContent = roomName;
    li.classList.add("room-item");
    li.onclick = () => onRoomClick(roomName);
    roomList.appendChild(li);
  });
}
