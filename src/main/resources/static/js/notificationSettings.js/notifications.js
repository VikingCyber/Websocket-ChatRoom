import { pushToggle } from "../ui/domElements.js";


function areNotificationsEnabled() {
  return localStorage.getItem("pushEnabled") === "true";
}

function setNotificationsEnabled(enabled) {
  localStorage.setItem("pushEnabled", enabled ? "true" : "false");
}

export function showNotification(title, options) {
  if (Notification.permission !== "granted") {
    console.warn("Уведомления не разрешены в браузере.");
    return;
  }

  if (!areNotificationsEnabled()) {
    console.log("Уведомления отключены пользователем в приложении");
  }

  new Notification(title, options);

}

function updateToggleState() {
  const permission = Notification.permission;
  const enabled = areNotificationsEnabled();

  if (permission === "denied") {
    pushToggle.checked = false;
    pushToggle.disabled = true;
  } else if (permission === "default") {
    pushToggle.checked = false;
    pushToggle.disabled = false;
  } else if (permission === "granted") {
    pushToggle.disabled = false;
    pushToggle.checked = enabled;
  }
}

export function handlePushToggleChange(event) {
  const isChecked = event.target.checked;

  if (Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        setNotificationsEnabled(true);
        updateToggleState();
        console.log("Уведомления разрешены");
      } else {
        event.target.checked = false;
        setNotificationsEnabled(false);
        updateToggleState();
        alert("Чтобы получить уведомления, разрешите их в настройках браузера.");
      }
    });
  } else if (Notification.permission === "denied") {
    setTimeout(() => {
      event.target.checked = false;
    }, 0);
    setNotificationsEnabled(false);
    updateToggleState();
    alert("Уведомления заблокированы в настройках браузера. Разрешите их вручную.");
  } else if (Notification.permission === "granted") {
    setNotificationsEnabled(isChecked);
    updateToggleState();
  }
}

export function initNotifications() {
  updateToggleState();
}
