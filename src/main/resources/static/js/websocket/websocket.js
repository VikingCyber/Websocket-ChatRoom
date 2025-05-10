'use strict';

import { enterRoom } from '../room/roomController.js';
import { appState } from '../state/appState.js';
import { displayRooms, showRoomSelectionPage } from '../ui/ui.js';
import { subscriptionManager } from './subscriptionManager.js';

export function connectToServer() {
  let socket = new SockJS('/ws');
  appState.stompClient = Stomp.over(socket);
  appState.stompClient.connect({}, onConnected, onError);
}

export function onConnected() {
  console.log('Connected to WebSocket');
  subscriptionManager.subscribe(
    "rooms",
    appState.stompClient,
    "/topic/rooms",
    (payload) => {
      let data = JSON.parse(payload.body);
      displayRooms(data, enterRoom);
    }
  );
  appState.stompClient.send("/app/chat.getRooms", {}, "");
  showRoomSelectionPage();
}

export function onError(error) {
  document.querySelector('.connecting').textContent = 'Could not connect to WebSocket server. Please refresh this page.';
}

export function subscribeToTopic(topic, callback) {
  return stompClient.subscribe(topic, callback);
}

export function sendMessage(destination, message) {
  appState.stompClient.send(destination, {}, JSON.stringify(message));
}

export function unsubscribe() {
  if (subscription) subscription.unsubscribe();
}
