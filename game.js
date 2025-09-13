import { MapBuilder } from './map-builder.js';
import { ScreenPainter } from './screen-painter.js';
import { InputController } from './input-controller.js';
import { EventBus, Events } from './event-bus.js';

export class Game {
  spaces = 11;
  dimensions = 3;

  constructor() {
    this.eventBus = new EventBus();

    this.state = {
      infoPanel: {
        dirty: true,
        fps: 0,
        mouseX: 0,
        mouseY: 0,
      },
      player: {
        x: Math.floor(this.spaces / 2),
        y: Math.floor(this.spaces / 2),
        z: Math.floor(this.spaces / 2),
      },
      zxPlane: { dirty: true },
      xyPlane: { dirty: true },
      yzPlane: { dirty: true },
    };

    const mapBuilder = new MapBuilder(this.spaces, this.dimensions);
    this.map = mapBuilder.newMap();

    this.screenPainter = new ScreenPainter(this.state, this.map, this.spaces, this.dimensions);

    new InputController(this.eventBus);

    this.eventBus.subscribe(Events.requestMove, event => this.handleMove(event));
    this.eventBus.subscribe(Events.inspectPoint, event => this.handleInspect(event));
  }

  isMoveValid(newSpace) {
    return this.map.isSpaceInBounds(newSpace) && this.map.isSpaceOpen(newSpace);
  }

  handleMove({dimension, distance}) {
    const newSpace = {...this.state.player};
    newSpace[dimension] += distance;

    if (this.isMoveValid(newSpace)) {
      this.state.player[dimension] += distance;
      this.state.zxPlane.dirty = true;
      this.state.xyPlane.dirty = true;
      this.state.yzPlane.dirty = true;
      this.state.infoPanel.dirty = true
    }
  }

  handleInspect({x, y}) {
    this.state.infoPanel.mouseX = x;
    this.state.infoPanel.mouseY = y;
    this.state.infoPanel.dirty = true;
  };

  update(delta) {
    // time since last update in milliseconds
    const updatedFps = Math.round(1000 / delta);
    if (this.state.infoPanel.fps != updatedFps) {
      this.state.infoPanel.fps = updatedFps;
      this.state.infoPanel.dirty = true;
    }
  };

  display() {
    this.screenPainter.render();
  }
}
