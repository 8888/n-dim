const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

let viewConfig = {
  // static
  map: { spaces: 11, clearMargin: 5 },
  // dynamic
  infoPanel: { x: 0, y: 0, width: 0, height: 0 },
  xyPlane: { x: 0, y: 0, width: 0, height: 0, spacing: 0 },
}

const colors = {
  black: '#000000',
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
  xyPlane: {
    dirty: true,
  },
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

  state.infoPanel.dirty = true;
  state.xyPlane.dirty = true;
}

const handleMove = (key) => {
  if (key === 'a' && state.player.x > 0) {
    state.player.x--;
    state.xyPlane.dirty = true;
    state.infoPanel.dirty = true
  } else if (key === 'q' && state.player.x < viewConfig.map.spaces - 1) {
    state.player.x++;
    state.xyPlane.dirty = true;
    state.infoPanel.dirty = true;
  } else if (key === 's' && state.player.y > 0) {
    state.player.y--;
    state.xyPlane.dirty = true;
    state.infoPanel.dirty = true;
  } else if (key === 'w' && state.player.y < viewConfig.map.spaces - 1) {
    state.player.y++;
    state.xyPlane.dirty = true;
    state.infoPanel.dirty = true;
  } else if ( key === 'd' && state.player.z > 0) {
    state.player.z--;
    // set z view dirty
    state.infoPanel.dirty = true;
  } else if (key === 'e' && state.player.z < viewConfig.map.spaces - 1) {
    state.player.z++;
    // set z view dirty
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

  // remember x y is starting location, width height is distance from x y, not location of the end point
  viewConfig = {
    ...viewConfig,
    infoPanel: { x: 0, y: 0, width: canvas.width * 1, height: canvas.height * .05 },
    get xyPlane() {
      return {
        x: 0,
        y: this.infoPanel.y + this.infoPanel.height,
        width: canvas.width / 3,
        height: canvas.height / 3,
        spacing: (canvas.height / 3) / (this.map.spaces + 2), // fit the board plus a margin on each side equal to the space size
      }
    }
  }

  console.log(viewConfig);

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

const displayInfoPanel = () => {
  if (!state.infoPanel.dirty) return;

  // indent all clears to avoid aliasing border lines due to thickness
  ctx.clearRect(
    viewConfig.infoPanel.x + viewConfig.map.clearMargin,
    viewConfig.infoPanel.y + viewConfig.map.clearMargin,
    viewConfig.infoPanel.width - viewConfig.map.clearMargin * 2,
    viewConfig.infoPanel.height - viewConfig.map.clearMargin * 2
  );

  const fpsStart = 20;
  const coordsStart = fpsStart + 140;
  const cursorStart = coordsStart + 200;
  ctx.fillStyle = colors.black;
  ctx.font = `${(viewConfig.infoPanel.height - viewConfig.infoPanel.y) * .4}px Verdana`;
  ctx.fillText(`${state.infoPanel.fps} FPS`, viewConfig.infoPanel.x + fpsStart, viewConfig.infoPanel.y + (viewConfig.infoPanel.height / 2));
  ctx.fillText(`[ x: ${state.player.x}, y: ${state.player.y}, z: ${state.player.z} ]`, viewConfig.infoPanel.x + coordsStart, viewConfig.infoPanel.y + (viewConfig.infoPanel.height / 2));
  ctx.fillText(`cursor: (x: ${state.infoPanel.mouseX}, y: ${state.infoPanel.mouseY})`, viewConfig.infoPanel.x + cursorStart, viewConfig.infoPanel.y + (viewConfig.infoPanel.height / 2));

  state.infoPanel.dirty = false;
};

const displayxyPlane = () => {
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
  const grid = [];
  for (let i = 0; i < viewConfig.map.spaces + 1; i++) { // 11 lines for 10 space grid
    grid.push({
      xStart: viewConfig.xyPlane.x + leftMargin,
      yStart: viewConfig.xyPlane.y + topMargin + spaceSize * i,
      xEnd: viewConfig.xyPlane.x + leftMargin + viewConfig.map.spaces * spaceSize,
      yEnd: viewConfig.xyPlane.y + topMargin + spaceSize * i,
    });

    grid.push({
      xStart: viewConfig.xyPlane.x + leftMargin + spaceSize * i,
      yStart: viewConfig.xyPlane.y + topMargin,
      xEnd: viewConfig.xyPlane.x + leftMargin  + spaceSize * i,
      yEnd: viewConfig.xyPlane.y + topMargin + viewConfig.map.spaces * spaceSize,
    });
  }

  drawLines(grid, colors.black, 1);

  // x is correct with zero left
  // invert y to have zero on bottom
  const xLoc = state.player.x;
  const yLoc = viewConfig.map.spaces - 1 - state.player.y;
  ctx.fillStyle = colors.blue;
  ctx.beginPath();
  ctx.arc(
    viewConfig.xyPlane.x + leftMargin + (spaceSize / 2) + (spaceSize * xLoc),
    viewConfig.xyPlane.y + topMargin + (spaceSize / 2) + (spaceSize * yLoc),
    (spaceSize / 2) - 2,
    0,
    2 * Math.PI,
  );
  ctx.fill();

  //  y axis
  const verticle = {
    xStart: viewConfig.xyPlane.x + (leftMargin * 2) + viewConfig.map.spaces * spaceSize,
    yStart: viewConfig.xyPlane.y + topMargin + spaceSize * viewConfig.map.spaces,
    xEnd: viewConfig.xyPlane.x + (leftMargin * 2) + viewConfig.map.spaces * spaceSize,
    yEnd: viewConfig.xyPlane.y + topMargin + spaceSize * (viewConfig.map.spaces / 2),
  };

  drawLines([verticle], colors.green, 1);

  ctx.fillStyle = colors.green;
  ctx.font = `${spaceSize * .75}px Verdana`;
  ctx.fillText(`y: ${state.player.y}`, verticle.xEnd + spaceSize/2, verticle.yStart - spaceSize * 2.5);

  // x axis
  const horizontal = {
    xStart: viewConfig.xyPlane.x + (leftMargin * 2) + viewConfig.map.spaces * spaceSize,
    yStart: viewConfig.xyPlane.y + topMargin + spaceSize * viewConfig.map.spaces,
    xEnd: viewConfig.xyPlane.x + (leftMargin * 2) + (viewConfig.map.spaces * 1.5) * spaceSize,
    yEnd: viewConfig.xyPlane.y + topMargin + spaceSize * viewConfig.map.spaces,
  };

  drawLines([horizontal], colors.red, 1);

  ctx.fillStyle = colors.red;
  ctx.font = `${spaceSize * .75}px Verdana`;
  ctx.fillText(`x: ${state.player.x}`, horizontal.xStart + spaceSize * 2, horizontal.yEnd - spaceSize/2);

  state.xyPlane.dirty = false;
}

const display = () => {
  displayInfoPanel();
  displayxyPlane();
}

window.onload = () => {
  init();
  let mainLoopUpdateLast = performance.now();
  (function mainLoop(nowTime) {
    update(nowTime - mainLoopUpdateLast);
    display();
    mainLoopUpdateLast = nowTime;
    requestAnimationFrame(mainLoop);
  })(performance.now());
};
