'use strict';

import { saveMessage } from '../message-storage/storageManager.js';
import { showNotification } from '../notificationSettings.js/notifications.js';
import { appState } from '../state/appState.js';
import { messageArea } from '../ui/domElements.js';
import { createElement, getAvatarColor } from '../utils/utils.js';


export function onMessageReceived(payload) {
  try {
    let message = JSON.parse(payload.body);
    let messageElement = createMessageElement(message);
    saveMessage(appState.room, message);

    if (messageArea) {
      messageArea.appendChild(messageElement);
      messageArea.scrollTop = messageArea.scrollHeight;
    } else {
      console.error("messageArea не найден в DOM");
    }

    if (message.type === "CHAT") {
      console.log("Новое сообщение:", message);
      console.log("Текущий пользователь:", appState.username);
      console.log("document.hidden:", document.hidden);
      console.log(`Получено сообщение от ${message.sender}, я ${appState.username}`);

      if (message.sender !== appState.username && document.hidden) {
        console.log("Показываем уведомление");
        showNotification(`Сообщение от ${message.sender}`, { body: message.content });
      }
    }

  } catch (error) {
    console.error("Ошибка при обработке сообщения от сервера:", error);
  }
}

export function createMessageElement(message) {
  if (!message || !message.type || !message.sender) {
    console.error("Некорректный формат сообщения: ", message);
    return null;
  }

  const messageElement = document.createElement('li');

  if (message.type === "JOIN" || message.type === "LEAVE") {
    messageElement.classList.add("event-message");
    messageElement.textContent = `${message.sender} ${message.type === "JOIN" ? "joined!" : "left!"}`;
    return messageElement;
  }

  messageElement.classList.add("chat-message");
  if (message.sender === appState.username) {
    messageElement.classList.add("my-message");
  } else {
    messageElement.classList.add("other-message");
  }

  const avatarElement = createAvatar(message.sender);
  messageElement.appendChild(avatarElement);

  const contentWrapper = document.createElement("div");
  contentWrapper.classList.add("message-content");

  const senderElement = document.createElement("span");
  senderElement.classList.add("sender-name");
  senderElement.textContent = message.sender;
  contentWrapper.appendChild(senderElement)

  const textElement = document.createElement("p");
  textElement.textContent = message.content;
  contentWrapper.appendChild(textElement);

  messageElement.appendChild(contentWrapper);

  return messageElement;
}


function createAvatar(sender) {
  const avatarElement = createElement("i", [], sender[0])
  avatarElement.style["background-color"] = getAvatarColor(sender);
  return avatarElement;
}

function createUsernameElement(sender) {
  return createElement("span", [], sender);
}
