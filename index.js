import { MapBuilder } from './map-builder.js';
import { DisplayManager } from './display-manager.js';
import { ViewConfig } from './view-config.js';
import { Colors } from './helpers.js'

const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

const viewConfig = new ViewConfig(11, 3);

const state = {
  infoPanel: {
    dirty: true,
    fps: 0,
    mouseX: 0,
    mouseY: 0,
  },
  player: {
    x: Math.floor(viewConfig.map.spaces / 2),
    y: Math.floor(viewConfig.map.spaces / 2),
    z: Math.floor(viewConfig.map.spaces / 2),
  },
  zxPlane: { dirty: true },
  xyPlane: { dirty: true },
  yzPlane: { dirty: true },
};

const drawLines = (lines, color, lineWidth) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  lines.forEach(line => {
    ctx.moveTo(line.xStart, line.yStart);
    ctx.lineTo(line.xEnd, line.yEnd);
  });

  ctx.stroke();
}

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // remember x y is starting location, width height is distance from x y, not location of the end point
  const planeWidth = canvas.width / 3;
  const planeHeight = canvas.height / 3;
  const spaceSize = (canvas.height / 3) / (viewConfig.map.spaces + 2); // fit the board plus a margin on each side equal to the space size
  viewConfig.updateInfoPanel({ x: 0, y: 0, width: canvas.width * 1, height: canvas.height * .05 });
  viewConfig.updateZXPlane({
    x: 0,
    y: viewConfig.infoPanel.y + viewConfig.infoPanel.height,
    width: planeWidth,
    height: planeHeight,
    spacing: spaceSize,
  });
  viewConfig.updateXYPlane({
    x: planeWidth,
    y: viewConfig.infoPanel.y + viewConfig.infoPanel.height,
    width: planeWidth,
    height: planeHeight,
    spacing: spaceSize,
  });
  viewConfig.updateYZPlane({
    x: planeWidth * 2,
    y: viewConfig.infoPanel.y + viewConfig.infoPanel.height,
    width: planeWidth,
    height: planeHeight,
    spacing: spaceSize,
  });

  console.log(viewConfig);

  state.infoPanel.dirty = true;
  state.zxPlane.dirty = true;
  state.xyPlane.dirty = true;
  state.yzPlane.dirty = true;
}

const isSpaceOpen = (x, y, z) => {
  return map.getSpaceContents(x, y, z) === '.';
}

const handleMove = (key) => {
  if (key === 'a' && state.player.x > 0 && isSpaceOpen(state.player.x - 1, state.player.y, state.player.z)) {
    state.player.x--;
    state.zxPlane.dirty = true;
    state.xyPlane.dirty = true;
    state.yzPlane.dirty = true;
    state.infoPanel.dirty = true
  } else if (key === 'q' && state.player.x < viewConfig.map.spaces - 1 && isSpaceOpen(state.player.x + 1, state.player.y, state.player.z)) {
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
  } else if (key === 'w' && state.player.y < viewConfig.map.spaces - 1 && isSpaceOpen(state.player.x, state.player.y + 1, state.player.z)) {
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
  } else if (key === 'e' && state.player.z < viewConfig.map.spaces - 1 && isSpaceOpen(state.player.x , state.player.y, state.player.z + 1)) {
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

const init = () => {
  // draw area borders that won't need repainting
  const infoBorder = {
    xStart: viewConfig.infoPanel.x,
    yStart: viewConfig.infoPanel.height,
    xEnd: viewConfig.infoPanel.x + viewConfig.infoPanel.width,
    yEnd: viewConfig.infoPanel.height,
  }

  const xyBorder = {
    xStart: viewConfig.xyPlane.x,
    yStart: viewConfig.infoPanel.height + viewConfig.xyPlane.height,
    xEnd: viewConfig.xyPlane.x + viewConfig.xyPlane.width,
    yEnd: viewConfig.infoPanel.height + viewConfig.xyPlane.height,
  }

  drawLines([infoBorder, xyBorder], Colors.black, 2);
};

const update = (delta) => {
  // time since last update in milliseconds
  const updatedFps = Math.round(1000 / delta);
  if (state.infoPanel.fps != updatedFps) {
    state.infoPanel.fps = updatedFps;
    state.infoPanel.dirty = true;
  }
};

window.addEventListener('resize', resizeCanvas);
window.addEventListener('keydown', event => handleMove(event.key));
window.addEventListener('click', event => handleClick(event));

resizeCanvas();

const mapBuilder = new MapBuilder(viewConfig);
const map = mapBuilder.newMap();
console.log(map);

const displayManager = new DisplayManager(state, viewConfig, ctx, map);

window.onload = () => {
  init();
  let mainLoopUpdateLast = performance.now();
  (function mainLoop(nowTime) {
    update(nowTime - mainLoopUpdateLast);
    displayManager.render();
    mainLoopUpdateLast = nowTime;
    requestAnimationFrame(mainLoop);
  })(performance.now());
};
