export const Events = {
  requestMove: 'requestMove',
  inspectPoint: 'inspectPoint',
};

export class EventBus {
  // Currently unable to unsubscribe from events
  constructor() {
    this.subscribers = {};
    for (const [key, value] of Object.entries(Events)) {
      this.subscribers[value] = [];
    }
  }

  subscribe(eventName, callback) {
    try {
      if (!Events[eventName]) throw new Error(`Event name ${eventName} not registered! Unable to subscribe`)

      this.subscribers[eventName].push(callback);
    } catch (e) {
      console.error(e);
    }
  }

  publish(eventName, data) {
    try {
      if (!Events[eventName]) throw new Error(`Event name ${eventName} not registered! Unable to publish`)

      this.subscribers[eventName].forEach(callback => callback(data));
    } catch (e) {
      console.error(e);
    }
  }
}
