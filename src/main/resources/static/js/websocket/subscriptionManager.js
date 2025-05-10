export const subscriptionManager = {
  subscriptions: {},

  /**
   * Добавляет новую подписку или заменяет старую
   * @param {string} name — имя подписки (уникальный ключ)
   * @param {object} stompClient — подключённый Stomp client
   * @param {string} destination — топик/канал для подписки
   * @param {function} callback — обработчик сообщений
   */
  subscribe(name, stompClient, destination, callback) {
    // Если уже есть подписка с таким именем — отписываем
    if (this.subscriptions[name]) {
      this.subscriptions[name].unsubscribe();
    }

    // Подписываемся
    const subscription = stompClient.subscribe(destination, callback);
    this.subscriptions[name] = subscription;

    return subscription;
  },

  remove(name) {
    if (this.subscriptions[name]) {
      this.subscriptions[name].unsubscribe();
      delete this.subscriptions[name];
    }
  },

  clear() {
    for (const name in this.subscriptions) {
      this.subscriptions[name].unsubscribe();
    }
    this.subscriptions = {};
  }
};