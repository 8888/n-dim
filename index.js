import { MapBuilder } from './map-builder.js';
import { ScreenPainter } from './screen-painter.js';
import { DisplayManager } from './display-manager.js';

const displayManager = new DisplayManager(11, 3);

const state = {
  infoPanel: {
    dirty: true,
    fps: 0,
    mouseX: 0,
    mouseY: 0,
  },
  player: {
    x: Math.floor(displayManager.map.spaces / 2),
    y: Math.floor(displayManager.map.spaces / 2),
    z: Math.floor(displayManager.map.spaces / 2),
  },
  zxPlane: { dirty: true },
  xyPlane: { dirty: true },
  yzPlane: { dirty: true },
};

const mapBuilder = new MapBuilder(displayManager);
const map = mapBuilder.newMap();
console.log(map);

/* todo
why does ScreenPainter get to be the boss?
DisplayManager should have a screen painter and manage it
*/
const screenPainter = new ScreenPainter(state, displayManager, map);

const isSpaceOpen = (x, y, z) => {
  return map.getSpaceContents(x, y, z) === '.';
}

/* todo
this should go to an input controller
then Game can be out here and hold logic
Game shouldn't require a view or inputs, it should still work.
it's really just kniwing that it has to be key a
let the input controller say there was a move x up, or move y down move event and Game here updates the state
*/
const handleMove = (key) => {
  if (key === 'a' && state.player.x > 0 && isSpaceOpen(state.player.x - 1, state.player.y, state.player.z)) {
    state.player.x--;
    state.zxPlane.dirty = true;
    state.xyPlane.dirty = true;
    state.yzPlane.dirty = true;
    state.infoPanel.dirty = true
  } else if (key === 'q' && state.player.x < displayManager.map.spaces - 1 && isSpaceOpen(state.player.x + 1, state.player.y, state.player.z)) {
    state.player.x++;
    state.zxPlane.dirty = true;
    state.xyPlane.dirty = true;
    state.yzPlane.dirty = true;
    state.infoPanel.dirty = true;
  } else if (key === 's' && state.player.y > 0 && isSpaceOpen(state.player.x, state.player.y - 1, state.player.z)) {
    state.player.y--;
    state.zxPlane.dirty = true;
    state.xyPlane.dirty = true;
    state.yzPlane.dirty = true;
    state.infoPanel.dirty = true;
  } else if (key === 'w' && state.player.y < displayManager.map.spaces - 1 && isSpaceOpen(state.player.x, state.player.y + 1, state.player.z)) {
    state.player.y++;
    state.zxPlane.dirty = true;
    state.xyPlane.dirty = true;
    state.yzPlane.dirty = true;
    state.infoPanel.dirty = true;
  } else if ( key === 'd' && state.player.z > 0 && isSpaceOpen(state.player.x, state.player.y, state.player.z - 1)) {
    state.player.z--;
    state.zxPlane.dirty = true;
    state.xyPlane.dirty = true;
    state.yzPlane.dirty = true;
    state.infoPanel.dirty = true;
  } else if (key === 'e' && state.player.z < displayManager.map.spaces - 1 && isSpaceOpen(state.player.x , state.player.y, state.player.z + 1)) {
    state.player.z++;
    state.zxPlane.dirty = true;
    state.xyPlane.dirty = true;
    state.yzPlane.dirty = true;
    state.infoPanel.dirty = true;
  }
}

const handleClick = (event) => {
  state.infoPanel.mouseX = event.clientX;
  state.infoPanel.mouseY = event.clientY;
  state.infoPanel.dirty = true;
};

const update = (delta) => {
  // time since last update in milliseconds
  const updatedFps = Math.round(1000 / delta);
  if (state.infoPanel.fps != updatedFps) {
    state.infoPanel.fps = updatedFps;
    state.infoPanel.dirty = true;
  }
};

/* todo
this would be in the input controller
Game would subscribe to events Move, Inspect, Resize
Maybe not resize, we may need to move the Canvas itself into the view. Then game never cares about a resize, the view captures the event because it owns the canvas, and then makes the change
*/
window.addEventListener('resize', screenPainter.resizeCanvas);
window.addEventListener('keydown', event => handleMove(event.key));
window.addEventListener('click', event => handleClick(event));

screenPainter.resizeCanvas();

window.onload = () => {
  let mainLoopUpdateLast = performance.now();
  (function mainLoop(nowTime) {
    update(nowTime - mainLoopUpdateLast);
    screenPainter.render();
    mainLoopUpdateLast = nowTime;
    requestAnimationFrame(mainLoop);
  })(performance.now());
};
