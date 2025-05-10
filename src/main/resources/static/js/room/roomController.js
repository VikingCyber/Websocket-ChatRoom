"use strict";

import { renderSavedMessages } from "../message-storage/storageManager.js";
import { onMessageReceived } from "../messages/messages.js";
import { appState } from "../state/appState.js";
import { messageArea, newRoomNameInput, roomNameTitle } from "../ui/domElements.js";
import { navigateToChatPage, navigateToRoomPage } from "../ui/ui.js";
import { subscriptionManager } from "../websocket/subscriptionManager.js";

export function enterRoom(roomName) {
  if (!roomName) {
    console.warn("Комната не указана");
    return;
  }
  appState.room = roomName;
  try {
    sessionStorage.setItem("room", appState.room);
    sessionStorage.setItem("username", appState.username);
  } catch (error) {
    console.error("Ошибка при сохранении данных в sessionStorage: ", error);
  }
  joinRoom();
  navigateToChatPage();
  renderSavedMessages(appState.room)
}

function joinRoom() {
  if (!appState.stompClient) {
    console.error("Ошибка: stompClient не инициализирован");
    return;
  }

  if (!appState.room) {
    console.error('Ошибка: комната не указана');
    return;
  }

  if (!appState.username) {
    console.error('Ошибка: имя пользователя не указано');
    return;
  }

  const topic = `/topic/public/${appState.room}`;

  subscriptionManager.subscribe(
    appState.room,
    appState.stompClient,
    topic,
    onMessageReceived
  );

  try {
    appState.stompClient.send("/app/chat.addUser", {}, JSON.stringify({
      sender: appState.username,
      type: "JOIN",
      room: appState.room
    }));

    console.log(`${appState.username} присоединился к комнате ${appState.room}`);
    messageArea.innerHTML = "";
  } catch (error) {
    console.error("Ошибка при отправке запроса на сервер: ", error);
  }
  if (roomNameTitle) {
    roomNameTitle.innerText = "Room: " + appState.room;
  } else {
    console.error("Ошибка: не найден элемент room-name-title");
  }
}

export function leaveRoom() {
  if (!appState.stompClient || !appState.room || !appState.username) {
    console.warn("Нет активного подключения или комнаты");
    return;
  }

  appState.stompClient.send("/app/chat.leaveUser", {}, JSON.stringify({
    sender: appState.username,
    type: "LEAVE",
    room: appState.room
  }));

  if (appState.room) {
    subscriptionManager.remove(appState.room);
  }

  sessionStorage.removeItem("room");
  appState.room = null;
  navigateToRoomPage();
}

export function disconnect() {
  if (appState.stompClient) {
    subscriptionManager.clear();
    appState.stompClient.disconnect();
  }
}

export function createRoom() {
  const roomName = newRoomNameInput.value.trim();

  if (roomName && appState.stompClient) {
    appState.stompClient.send("/app/chat.createRoom", {}, roomName);
    newRoomNameInput.value = "";
  } else {
    console.warn("Комната не указана или stompClient не подключен");
  }
}