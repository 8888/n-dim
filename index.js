import { MapBuilder } from './map-builder.js';
import { DisplayManager } from './display-manager.js';
import { ViewConfig } from './view-config.js';

const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

let map;

const viewConfig = new ViewConfig(11, 3);

const colors = {
  black: '#000000',
  gray: '#808080',
  blue: '#0000ff',
  green: '#2eb52a',
  red: '#993000',
  purple: '#9858b8',
};

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
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('keydown', event => handleMove(event.key));
  window.addEventListener('click', event => handleClick(event));

  resizeCanvas();

  const mapBuilder = new MapBuilder(viewConfig);
  map = mapBuilder.newMap();
  console.log(map);

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

  drawLines([infoBorder, xyBorder], colors.black, 2);
};

const update = (delta) => {
  // time since last update in milliseconds
  const updatedFps = Math.round(1000 / delta);
  if (state.infoPanel.fps != updatedFps) {
    state.infoPanel.fps = updatedFps;
    state.infoPanel.dirty = true;
  }
};

const drawGrid = (plane, leftMargin, topMargin, spaceSize) => {
  const grid = [];
  for (let i = 0; i < viewConfig.map.spaces + 1; i++) { // 11 lines for 10 space grid
    grid.push({
      xStart: plane.x + leftMargin,
      yStart: plane.y + topMargin + spaceSize * i,
      xEnd: plane.x + leftMargin + viewConfig.map.spaces * spaceSize,
      yEnd: plane.y + topMargin + spaceSize * i,
    });

    grid.push({
      xStart: plane.x + leftMargin + spaceSize * i,
      yStart: plane.y + topMargin,
      xEnd: plane.x + leftMargin  + spaceSize * i,
      yEnd: plane.y + topMargin + viewConfig.map.spaces * spaceSize,
    });
  }

  drawLines(grid, colors.black, 1);
};

const drawPlayer = (plane, xLoc, yLoc, leftMargin, topMargin, spaceSize) => {
  // x = horizontal axis
  // y = vertical axis
  // actual view on canvas, not player n-dim location
  // xLoc, yLoc are cell the player should be in from bottom left origin
  ctx.fillStyle = colors.blue;
  ctx.beginPath();
  ctx.arc(
    plane.x + leftMargin + (spaceSize / 2) + (spaceSize * xLoc),
    plane.y + topMargin + (spaceSize / 2) + (spaceSize * yLoc),
    (spaceSize / 2) - 2,
    0,
    2 * Math.PI,
  );
  ctx.fill();
};

const drawWall = (plane, xLoc, yLoc, leftMargin, topMargin, spaceSize) => {
  ctx.fillStyle = colors.gray;
  ctx.fillRect(
    plane.x + leftMargin + (spaceSize * xLoc),
    plane.y + topMargin + (spaceSize * yLoc),
    spaceSize,
    spaceSize
  )
}

const drawHelperAxis = (plane, leftMargin, topMargin, spaceSize, horizColor, horizText, vertColor, vertText) => {
  // x axis
  const horizontal = {
    xStart: plane.x + (leftMargin * 2) + viewConfig.map.spaces * spaceSize,
    yStart: plane.y + topMargin + spaceSize * viewConfig.map.spaces,
    xEnd: plane.x + (leftMargin * 2) + (viewConfig.map.spaces * 1.5) * spaceSize,
    yEnd: plane.y + topMargin + spaceSize * viewConfig.map.spaces,
  };

  drawLines([horizontal], horizColor, 1);

  ctx.fillStyle = horizColor;
  ctx.font = `${spaceSize * .75}px Verdana`;
  ctx.fillText(horizText, horizontal.xStart + spaceSize * 2, horizontal.yEnd - spaceSize/2);

  //  y axis
  const verticle = {
    xStart: plane.x + (leftMargin * 2) + viewConfig.map.spaces * spaceSize,
    yStart: plane.y + topMargin + spaceSize * viewConfig.map.spaces,
    xEnd: plane.x + (leftMargin * 2) + viewConfig.map.spaces * spaceSize,
    yEnd: plane.y + topMargin + spaceSize * (viewConfig.map.spaces / 2),
  };

  drawLines([verticle], vertColor, 1);

  ctx.fillStyle = vertColor;
  ctx.font = `${spaceSize * .75}px Verdana`;
  ctx.fillText(vertText, verticle.xEnd + spaceSize/2, verticle.yStart - spaceSize * 2.5);
};

const displayZXPlane = () => {
  if (!state.zxPlane.dirty) return;

  // indent all clears to avoid aliasing border lines due to thickness
  ctx.clearRect(
    viewConfig.zxPlane.x + viewConfig.map.clearMargin,
    viewConfig.zxPlane.y + viewConfig.map.clearMargin,
    viewConfig.zxPlane.width - viewConfig.map.clearMargin * 2,
    viewConfig.zxPlane.height - viewConfig.map.clearMargin * 2
  );

  const leftMargin = viewConfig.zxPlane.spacing;
  const topMargin = viewConfig.zxPlane.spacing;
  const spaceSize = viewConfig.zxPlane.spacing;

  drawGrid(viewConfig.zxPlane, leftMargin, topMargin, spaceSize);

  // draw player
  // z is correct with zero left
  // invert x to have zero on bottom
  const xLoc = state.player.z;
  const yLoc = viewConfig.map.spaces - 1 - state.player.x;
  drawPlayer(viewConfig.zxPlane, xLoc, yLoc, leftMargin, topMargin, spaceSize);

  for (let x = 0; x < viewConfig.map.spaces; x++) {
    for (let z = 0; z < viewConfig.map.spaces; z++) {
      if (!isSpaceOpen(x, state.player.y, z)) {
        drawWall(
          viewConfig.zxPlane,
          z, // z is correct with zero left
          viewConfig.map.spaces - 1 - x, // invert x to have zero on bottom
          leftMargin,
          topMargin,
          spaceSize
        );
      }
    }
  }

  drawHelperAxis(
    viewConfig.zxPlane,
    leftMargin,
    topMargin,
    spaceSize,
    colors.purple,
    `z: ${state.player.z}`,
    colors.red,
    `x: ${state.player.x}`,
  );

  state.zxPlane.dirty = false;
}

const displayXYPlane = () => {
  if (!state.xyPlane.dirty) return;

  // indent all clears to avoid aliasing border lines due to thickness
  ctx.clearRect(
    viewConfig.xyPlane.x + viewConfig.map.clearMargin,
    viewConfig.xyPlane.y + viewConfig.map.clearMargin,
    viewConfig.xyPlane.width - viewConfig.map.clearMargin * 2,
    viewConfig.xyPlane.height - viewConfig.map.clearMargin * 2
  );

  const leftMargin = viewConfig.xyPlane.spacing;
  const topMargin = viewConfig.xyPlane.spacing;
  const spaceSize = viewConfig.xyPlane.spacing;

  drawGrid(viewConfig.xyPlane, leftMargin, topMargin, spaceSize);

  // draw player
  // x is correct with zero left
  // invert y to have zero on bottom
  const xLoc = state.player.x;
  const yLoc = viewConfig.map.spaces - 1 - state.player.y;
  drawPlayer(viewConfig.xyPlane, xLoc, yLoc, leftMargin, topMargin, spaceSize);

  for (let y = 0; y < viewConfig.map.spaces; y++) {
    for (let x = 0; x < viewConfig.map.spaces; x++) {
      if (!isSpaceOpen(x, y, state.player.z)) {
        drawWall(
          viewConfig.xyPlane,
          x, // x is correct with zero left
          viewConfig.map.spaces - 1 - y, // invert y to have zero on bottom
          leftMargin,
          topMargin,
          spaceSize
        );
      }
    }
  }

  drawHelperAxis(
    viewConfig.xyPlane,
    leftMargin,
    topMargin,
    spaceSize,
    colors.red,
    `x: ${state.player.x}`,
    colors.green,
    `y: ${state.player.y}`,
  );

  state.xyPlane.dirty = false;
}

const displayYZPlane = () => {
  if (!state.yzPlane.dirty) return;

  ctx.clearRect(
    viewConfig.yzPlane.x + viewConfig.map.clearMargin,
    viewConfig.yzPlane.y + viewConfig.map.clearMargin,
    viewConfig.yzPlane.width - viewConfig.map.clearMargin * 2,
    viewConfig.yzPlane.height - viewConfig.map.clearMargin * 2
  );

  const leftMargin = viewConfig.yzPlane.spacing;
  const topMargin = viewConfig.yzPlane.spacing;
  const spaceSize = viewConfig.yzPlane.spacing;

  drawGrid(viewConfig.yzPlane, leftMargin, topMargin, spaceSize);

  // draw player
  // y is correct with zero left
  // invert z to have zero on bottom
  const yLoc = state.player.y;
  const zLoc = viewConfig.map.spaces - 1 - state.player.z;
  drawPlayer(viewConfig.yzPlane, yLoc, zLoc, leftMargin, topMargin, spaceSize);

  for (let z = 0; z < viewConfig.map.spaces; z++) {
    for (let y = 0; y < viewConfig.map.spaces; y++) {
      if (!isSpaceOpen(state.player.x, y, z)) {
        drawWall(
          viewConfig.yzPlane,
          y, // y is correct with zero left
          viewConfig.map.spaces - 1 - z, // invert z to have zero on bottom
          leftMargin,
          topMargin,
          spaceSize
        );
      }
    }
  }

  drawHelperAxis(
    viewConfig.yzPlane,
    leftMargin,
    topMargin,
    spaceSize,
    colors.green,
    `y: ${state.player.y}`,
    colors.purple,
    `z: ${state.player.z}`,
  );

  state.yzPlane.dirty = false;
}

const displayManager = new DisplayManager(state, viewConfig, ctx);

const display = () => {
  displayZXPlane();
  displayXYPlane();
  displayYZPlane();
}

window.onload = () => {
  init();
  let mainLoopUpdateLast = performance.now();
  (function mainLoop(nowTime) {
    update(nowTime - mainLoopUpdateLast);
    displayManager.render();
    display();
    mainLoopUpdateLast = nowTime;
    requestAnimationFrame(mainLoop);
  })(performance.now());
};
