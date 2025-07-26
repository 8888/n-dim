// Get the canvas and context
const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

let viewConfig = {
  // static
  map: { spaces: 10 },
  // dynamic
  infoPanel: { x: 0, y: 0, width: 0, height: 0 },
  xyPlane: { x: 0, y: 0, width: 0, height: 0, spacing: 0 },
}

const colors = {
  black: '#000000',
  blue: '#0000ff',
  green: '#2eb52a',
  red: '#993000',
};

const state = {
  infoPanel: {
    dirty: true,
    fps: 0,
  },
  player: {
    x: Math.round(viewConfig.map.spaces / 2),
    y: Math.round(viewConfig.map.spaces / 2),
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
  if ((key === 'ArrowLeft' || key === 'q') && state.player.x > 0) {
    state.player.x--;
    state.xyPlane.dirty = true;
    state.infoPanel.dirty = true
  } else if ((key === 'ArrowRight' || key === 'a') && state.player.x < viewConfig.map.spaces - 1) {
    state.player.x++;
    state.xyPlane.dirty = true;
    state.infoPanel.dirty = true;
  } else if ((key === 'ArrowUp' || key === 'w') && state.player.y > 0) {
    state.player.y--;
    state.xyPlane.dirty = true;
    state.infoPanel.dirty = true;
  } else if ((key === 'ArrowDown' || key === 's') && state.player.y < viewConfig.map.spaces - 1) {
    state.player.y++;
    state.xyPlane.dirty = true;
    state.infoPanel.dirty = true;
  }
}

const init = () => {
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('keydown', event => handleMove(event.key));
  resizeCanvas();

  viewConfig = {
    ...viewConfig,
    infoPanel: { x: 0, y: 0, width: canvas.width * 1, height: canvas.height * .05 },
    get xyPlane() {
      return {
        x: 0,
        y: this.infoPanel.height,
        width: canvas.width * 1,
        height: this.infoPanel.height + (canvas.height * .3),
        spacing: (this.infoPanel.height + (canvas.height * .3) - this.infoPanel.height) / 12, // (height - y) / 12 to get 12 equal spaces filling this whole area
      }
    }
  }
};

const update = (delta) => {
  const frameDelta = delta; // time since last update in milliseconds

  const updatedFps = Math.round(1000 / frameDelta);
  if (state.infoPanel.fps != updatedFps) {
    state.infoPanel.fps = updatedFps;
    state.infoPanel.dirty = true;
  }
};

const displayInfoPanel = () => {
  if (!state.infoPanel.dirty) return;

  ctx.clearRect(viewConfig.infoPanel.x, viewConfig.infoPanel.y, viewConfig.infoPanel.width, viewConfig.infoPanel.height);

  const divider = {
    xStart: viewConfig.infoPanel.x,
    yStart: viewConfig.infoPanel.height,
    xEnd: viewConfig.infoPanel.width,
    yEnd: viewConfig.infoPanel.height,
  }

  drawLines([divider], colors.black, 2);

  const fpsStart = 10;
  const coordsStart = fpsStart + 150;
  ctx.fillStyle = colors.black;
  ctx.font = `${(viewConfig.infoPanel.height - viewConfig.infoPanel.y) / 2}px Verdana`;
  ctx.fillText(`${state.infoPanel.fps} FPS`, viewConfig.infoPanel.x + fpsStart, viewConfig.infoPanel.y + (viewConfig.infoPanel.height / 2));
  ctx.fillText(`[ x: ${state.player.x}, y: ${state.player.y} ]`, viewConfig.infoPanel.x + coordsStart, viewConfig.infoPanel.y + (viewConfig.infoPanel.height / 2));

  state.infoPanel.dirty = false;
};

const displayxyPlane = () => {
  if (!state.xyPlane.dirty) return;

  ctx.clearRect(viewConfig.xyPlane.x, viewConfig.xyPlane.y, viewConfig.xyPlane.width, viewConfig.xyPlane.height);

  const divider = {
    xStart: viewConfig.xyPlane.x,
    yStart: viewConfig.xyPlane.height,
    xEnd: viewConfig.xyPlane.width,
    yEnd: viewConfig.xyPlane.height,
  }

  drawLines([divider], colors.black, 2);

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

  ctx.fillStyle = colors.blue;
  ctx.beginPath();
  ctx.arc(
    viewConfig.xyPlane.x + leftMargin + (spaceSize / 2) + (spaceSize * state.player.x),
    viewConfig.xyPlane.y + topMargin + (spaceSize / 2) + (spaceSize * state.player.y),
    (spaceSize / 2) - 2,
    0,
    2 * Math.PI,
  );
  ctx.fill();

  const verticle = {
    xStart: viewConfig.xyPlane.x + (leftMargin * 2) + viewConfig.map.spaces * spaceSize,
    yStart: viewConfig.xyPlane.y + topMargin + spaceSize * viewConfig.map.spaces,
    xEnd: viewConfig.xyPlane.x + (leftMargin * 2) + viewConfig.map.spaces * spaceSize,
    yEnd: viewConfig.xyPlane.y + topMargin + spaceSize * (viewConfig.map.spaces / 2),
  };

  drawLines([verticle], colors.green, 1);

  const horizontal = {
    xStart: viewConfig.xyPlane.x + (leftMargin * 2) + viewConfig.map.spaces * spaceSize,
    yStart: viewConfig.xyPlane.y + topMargin + spaceSize * viewConfig.map.spaces,
    xEnd: viewConfig.xyPlane.x + (leftMargin * 2) + (viewConfig.map.spaces * 1.5) * spaceSize,
    yEnd: viewConfig.xyPlane.y + topMargin + spaceSize * viewConfig.map.spaces,
  };

  drawLines([horizontal], colors.red, 1);

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
