import { pushToggle } from "../ui/domElements.js";
import { registerPush, unsubscribePush } from "./pushNotifications.js";

function areNotificationsEnabled() {
  return localStorage.getItem("pushEnabled") === "true";
}

function setNotificationsEnabled(enabled) {
  localStorage.setItem("pushEnabled", enabled ? "true" : "false");
}

function updateToggleState() {
  const permission = Notification.permission;
  const enabled = areNotificationsEnabled();

  if (permission === "denied") {
    pushToggle.checked = false;
    pushToggle.disabled = true;
  } else {
    pushToggle.disabled = false;
    pushToggle.checked = enabled;
  }
}

export async function handlePushToggleChange(event) {
  const isChecked = event.target.checked;

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      event.target.checked = false;
      alert("Разрешите уведомления в настройках браузера.");
      return;
    }
  }

  if (isChecked) {
    await registerPush();
    setNotificationsEnabled(true);
  } else {
    await unsubscribePush();
    setNotificationsEnabled(false);
  }

  updateToggleState();
}

export function initPushNotifications() {
  updateToggleState();
  pushToggle.addEventListener("change", handlePushToggleChange);
}