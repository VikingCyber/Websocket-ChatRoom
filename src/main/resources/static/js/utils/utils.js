'use strict';

const colors = [
  '#2196F3', '#32c787', '#00BCD4', '#ff5652',
  '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

export function getAvatarColor(sender) {
  let hash = 0;
  for (let i = 0; i < sender.length; i++) {
    hash = 31 * hash + sender.charCodeAt(i);
  }
  let index = Math.abs(hash % colors.length);
  return colors[index];
}

export function createElement(tag, classNames = [], textContent = "") {
  const element = document.createElement(tag);

  if (Array.isArray(classNames)) {
    classNames.forEach(cls => element.classList.add(cls));
  } else if (typeof classNames === "string") {
    element.classList.add(classNames);
  }

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}