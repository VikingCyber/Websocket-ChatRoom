"use strict";

import { createMessageElement } from "../messages/messages.js";


export function saveMessage(room, message) {
  if (message.type === "CHAT" && message.content !== null) {
    const key = `history-${room}`;
    const history = JSON.parse(sessionStorage.getItem(key)) || [];
    history.push(message);
    sessionStorage.setItem(key, JSON.stringify(history));
  }
}

export function loadMessageHistory(room) {
  const key = `history-${room}`;
  return JSON.parse(sessionStorage.getItem(key)) || [];
}

export function clearMessageHistory(room) {
  const key = `history-${room}`;
  sessionStorage.removeItem(key);
  console.log("Загружаем историю сообщений:", history); // Для проверки
}

if (history.length === 0) {
  console.log("История сообщений пуста.");
}

export function renderSavedMessages(room) {
  const history = loadMessageHistory(room);
  console.log("История сообщений: ", history);

  history.forEach(message => {
    const messageElement = createMessageElement(message);
    console.log("Элемент для вставки: ", messageElement);

    if (messageElement) {
      messageArea.appendChild(messageElement);
    } else {
      console.warn("Не получилось создать элемент для сообщения: ", message);
    }
  });
}
