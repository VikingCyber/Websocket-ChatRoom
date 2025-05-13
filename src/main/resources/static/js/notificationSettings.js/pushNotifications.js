// Функция для получения публичного VAPID ключа с сервера
async function getPublicVapidKey() {
  try {
    const response = await fetch('/api/push/public-key'); // Запрос на сервер
    if (!response.ok) {
      throw new Error('Не удалось получить публичный ключ');
    }
    const publicVapidKey = await response.text(); // Получаем ключ как текст
    return publicVapidKey;
  } catch (error) {
    console.error('Ошибка при получении публичного ключа:', error);
    return null;
  }
}

export async function registerPush() {
  if (!("serviceWorker" in navigator)) {
    console.error("Service Worker не поддерживается.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker зарегистрирован:", registration);

    // Проверка существующей подписки
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log("Подписка уже существует.");
      return;
    }

    // Получаем публичный VAPID ключ с сервера
    const publicVapidKey = await getPublicVapidKey();
    if (!publicVapidKey) {
      console.error("Не удалось получить публичный ключ.");
      return;
    }

    // Создаем новую подписку с использованием полученного ключа
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });

    console.log("Подписка создана:", subscription);

    // Отправляем подписку на сервер
    await fetch("api/push/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: { "Content-Type": "application/json" },
    });

    console.log("Подписка отправлена на сервер.");
  } catch (error) {
    console.error("Ошибка подписки:", error);
  }
}

export async function unsubscribePush() {
  if (!("serviceWorker" in navigator)) {
    console.error("Service Worker не поддерживается.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log("Подписка удалена.");

      // Уведомляем сервер об отписке
      await fetch("api/push/unsubscribe", {
        method: "POST",
        body: JSON.stringify({ endpoint: subscription.endpoint }),
        headers: { "Content-Type": "application/json" },
      });

      console.log("Сервер уведомлен об отписке.");
    } else {
      console.log("Подписки не найдено.");
    }
  } catch (error) {
    console.error("Ошибка отписки:", error);
  }
}

// Хелпер для преобразования VAPID ключа
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export function sendPushNotificationToServer(title, body) {
  fetch('/api/push/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body })
  });
}
