'use strict';

import { saveMessage } from '../message-storage/storageManager.js';
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

  const textElement = document.createElement("p");
  textElement.textContent = message.content;
  messageElement.appendChild(textElement);

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
