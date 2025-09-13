import { Events } from './event-bus.js';

export class InputController {
  constructor(eventBus) {
    this.eventBus = eventBus;

    window.addEventListener('keydown', event => this.handleKeyDown(event.key));
    window.addEventListener('click', event => this.handleClick(event));
  }

  // todo: make keystrokes configurable
  handleKeyDown(key) {
    if (key === 'a') {
      this.eventBus.publish(Events.requestMove, {dimension: 'x', distance: -1});
    } else if (key === 'q') {
      this.eventBus.publish(Events.requestMove, {dimension: 'x', distance: 1});
    } else if (key === 's') {
      this.eventBus.publish(Events.requestMove, {dimension: 'y', distance: -1});
    } else if (key === 'w') {
      this.eventBus.publish(Events.requestMove, {dimension: 'y', distance: 1});
    } else if (key === 'd') {
      this.eventBus.publish(Events.requestMove, {dimension: 'z', distance: -1});
    } else if (key === 'e') {
      this.eventBus.publish(Events.requestMove, {dimension: 'z', distance: 1});
    } else if (key === 'f' || key === 'z') {
      this.eventBus.publish(Events.requestMove, {dimension: 'w', distance: -1});
    } else if (key === 'r' || key === 'c') {
      this.eventBus.publish(Events.requestMove, {dimension: 'w', distance: 1});
    }
  }

  handleClick(event) {
    this.eventBus.publish(Events.inspectPoint, {x: event.clientX, y: event.clientY});
  }
}
