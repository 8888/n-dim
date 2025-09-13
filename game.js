import { DisplayManager } from './display-manager.js';
import { MapBuilder } from './map-builder.js';
import { ScreenPainter } from './screen-painter.js';

export class Game {
  spaces = 11;
  dimensions = 3;

  constructor() {
    this.displayManager = new DisplayManager(this.spaces, this.dimensions);

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

    /* todo
    why does ScreenPainter get to be the boss?
    this.displayManager should have a screen painter and manage it
    */
    this.screenPainter = new ScreenPainter(this.state, this.displayManager, this.map);

    /* todo
    this would be in the input controller
    Game would subscribe to events Move, Inspect, Resize
    Maybe not resize, we may need to move the Canvas itself into the view. Then game never cares about a resize, the view captures the event because it owns the canvas, and then makes the change
    */
    window.addEventListener('resize', this.screenPainter.resizeCanvas);
    window.addEventListener('keydown', event => this.handleMove(event.key));
    window.addEventListener('click', event => this.handleClick(event));
  }

  isSpaceOpen(x, y, z) {
    return this.map.getSpaceContents(x, y, z) === '.';
  }

  /* todo
  this should go to an input controller
  then Game can be out here and hold logic
  Game shouldn't require a view or inputs, it should still work.
  it's really just kniwing that it has to be key a
  let the input controller say there was a move x up, or move y down move event and Game here updates the state
  */
  handleMove(key) {
    if (key === 'a' && this.state.player.x > 0 && this.isSpaceOpen(this.state.player.x - 1, this.state.player.y, this.state.player.z)) {
      this.state.player.x--;
      this.state.zxPlane.dirty = true;
      this.state.xyPlane.dirty = true;
      this.state.yzPlane.dirty = true;
      this.state.infoPanel.dirty = true
    } else if (key === 'q' && this.state.player.x < this.spaces - 1 && this.isSpaceOpen(this.state.player.x + 1, this.state.player.y, this.state.player.z)) {
      this.state.player.x++;
      this.state.zxPlane.dirty = true;
      this.state.xyPlane.dirty = true;
      this.state.yzPlane.dirty = true;
      this.state.infoPanel.dirty = true;
    } else if (key === 's' && this.state.player.y > 0 && this.isSpaceOpen(this.state.player.x, this.state.player.y - 1, this.state.player.z)) {
      this.state.player.y--;
      this.state.zxPlane.dirty = true;
      this.state.xyPlane.dirty = true;
      this.state.yzPlane.dirty = true;
      this.state.infoPanel.dirty = true;
    } else if (key === 'w' && this.state.player.y < this.spaces - 1 && this.isSpaceOpen(this.state.player.x, this.state.player.y + 1, this.state.player.z)) {
      this.state.player.y++;
      this.state.zxPlane.dirty = true;
      this.state.xyPlane.dirty = true;
      this.state.yzPlane.dirty = true;
      this.state.infoPanel.dirty = true;
    } else if ( key === 'd' && this.state.player.z > 0 && this.isSpaceOpen(this.state.player.x, this.state.player.y, this.state.player.z - 1)) {
      this.state.player.z--;
      this.state.zxPlane.dirty = true;
      this.state.xyPlane.dirty = true;
      this.state.yzPlane.dirty = true;
      this.state.infoPanel.dirty = true;
    } else if (key === 'e' && this.state.player.z < this.spaces - 1 && this.isSpaceOpen(this.state.player.x , this.state.player.y, this.state.player.z + 1)) {
      this.state.player.z++;
      this.state.zxPlane.dirty = true;
      this.state.xyPlane.dirty = true;
      this.state.yzPlane.dirty = true;
      this.state.infoPanel.dirty = true;
    }
  }

  handleClick(event) {
    this.state.infoPanel.mouseX = event.clientX;
    this.state.infoPanel.mouseY = event.clientY;
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
