self.addEventListener('push', event => {
  try {
    console.log('Получено пуш-сообщение:', event);
    const data = event.data ? event.data.json() : {}; // Преобразуем в JSON
    console.log('Пуш данные:', data);
    const title = data.title || 'Новое уведомление';
    const options = {
      body: data.body || '',
    };
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Ошибка при обработке данных уведомления:', error);
  }
});
