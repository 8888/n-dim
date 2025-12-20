import { MapBuilder } from './map-builder.js';
import { ScreenPainter } from './screen-painter.js';
import { InputController } from './input-controller.js';
import { EventBus, Events } from './event-bus.js';

export class Game {
  spaces = 11;
  dimensions = 4;

  constructor() {
    this.eventBus = new EventBus();

    this.state = {
      infoPanel: {
        fps: 0,
        mouseX: 0,
        mouseY: 0,
      },
      player: {
        x: Math.floor(this.spaces / 2),
        y: Math.floor(this.spaces / 2),
        z: Math.floor(this.spaces / 2),
        w: Math.floor(this.spaces / 2),
      },
    };

    const mapBuilder = new MapBuilder(this.spaces, this.dimensions);
    this.map = mapBuilder.newMap();
    console.log(this.map);

    this.screenPainter = new ScreenPainter(this.state, this.map, this.spaces, this.dimensions, this.eventBus);

    new InputController(this.eventBus);

    this.eventBus.subscribe(Events.requestMove, event => this.handleMoveRequest(event));
    this.eventBus.subscribe(Events.inspectPoint, event => this.handleInspect(event));

    this.fpsAccumulator = 0;
    this.frames = 0;
  }

  isMoveValid(newSpace) {
    return this.map.isSpaceInBounds(newSpace) && this.map.isSpaceOpen(newSpace);
  }

  handleMoveRequest({dimension, distance}) {
    const newSpace = {...this.state.player};
    newSpace[dimension] += distance;

    if (this.isMoveValid(newSpace)) {
      this.eventBus.publish(Events.movePlayer, {
        from: this.state.player,
        to: newSpace,
        dimension,
        distance,
      });

      this.state.player[dimension] += distance;
    }
  }

  handleInspect({x, y}) {
    this.state.infoPanel.mouseX = x;
    this.state.infoPanel.mouseY = y;
  };

  update(delta) {
    // time since last update in milliseconds
    this.fpsAccumulator += delta;
    this.frames++;
    if (this.fpsAccumulator > 500) {
      this.state.infoPanel.fps = Math.round((this.frames * 1000) / this.fpsAccumulator);
      this.fpsAccumulator = 0;
      this.frames = 0;
    }
  };

  display() {
    this.screenPainter.render();
  }
}
