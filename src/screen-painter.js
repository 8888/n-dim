import { ViewConfig } from './view-config.js';
import { Colors } from './helpers.js'
import { Events } from './event-bus.js';

function interpolateColor(color1, color2, factor) {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export class ScreenPainter {
  constructor(state, map, spaces, dimensions, eventBus) {
    this.state = state;
    this.map = map;
    this.spaces = spaces;
    this.dimensions = dimensions;
    this.eventBus = eventBus;

    this.viewConfig = new ViewConfig(this.spaces, this.dimensions);

    this.canvas = document.getElementById('main-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();



    window.addEventListener('resize', this.resizeCanvas);

    this.eventBus.subscribe(Events.movePlayer, event => this.handleMove(event));
    // todo: not really using this
    this.eventBus.subscribe(Events.inspectPoint, () => this.viewConfig.infoPanel.dirty = true);
  }

  setMap(map) {
    this.map = map;
  }

  render(nowTime) {
    this.ctx.fillStyle = Colors.screenBackground;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawInfoPanel();
    this.viewConfig.allPlanes.forEach(plane => this.drawPlane(plane, nowTime));
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // remember x y is starting location, width height is distance from x y, not location of the end point
    const planeWidth = this.canvas.width / 3;
    const planeHeight = this.canvas.height / 3;
    const spaceSize = (this.canvas.height / 3) / (this.spaces + 2); // fit the board plus a margin on each side equal to the space size

    this.viewConfig.infoPanel.x = 0;
    this.viewConfig.infoPanel.y = 0;
    this.viewConfig.infoPanel.width = this.canvas.width * 1;
    this.viewConfig.infoPanel.height = this.canvas.height * .05;

    this.viewConfig.layout.forEach((row, r) => {
      row.forEach((plane, p) => {
        plane.x = planeWidth * p;
        plane.y = (this.viewConfig.infoPanel.y + this.viewConfig.infoPanel.height) + (r * (this.canvas.height * 0.4));
        plane.width = planeWidth;
        plane.height = planeHeight;
        plane.spacing = spaceSize;
      });
    });

    console.log(this.viewConfig);

    this.viewConfig.zxPlane.dirty = true;
    this.viewConfig.xyPlane.dirty = true;
    this.viewConfig.yzPlane.dirty = true;
  }

  // todo: will they all always be dirty? probably right?
  handleMove({from, to, dimension, distance}) {
    this.viewConfig.infoPanel.dirty = true;
    this.viewConfig.zxPlane.dirty = true;
    this.viewConfig.xyPlane.dirty = true;
    this.viewConfig.yzPlane.dirty = true;
  }



  drawPlayer(plane, xLoc, yLoc, leftMargin, topMargin, spaceSize) {
    // x = horizontal axis
    // y = vertical axis
    // actual view on canvas, not player n-dim location
    // xLoc, yLoc are cell the player should be in from bottom left origin
    this.ctx.fillStyle = Colors.player;
    this.ctx.strokeStyle = Colors.black;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(
      plane.x + leftMargin + (spaceSize / 2) + (spaceSize * xLoc),
      plane.y + topMargin + (spaceSize / 2) + (spaceSize * yLoc),
      (spaceSize / 2) - 2,
      0,
      2 * Math.PI,
    );
    this.ctx.fill();
    this.ctx.stroke();
  };

  drawGoal(plane, xLoc, yLoc, leftMargin, topMargin, spaceSize) {
    // x = horizontal axis
    // y = vertical axis
    // actual view on canvas, not player n-dim location
    // xLoc, yLoc are cell the player should be in from bottom left origin
    this.ctx.fillStyle = Colors.goal;
    this.ctx.strokeStyle = Colors.black;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.rect(
      plane.x + leftMargin + (spaceSize * xLoc) + 2,
      plane.y + topMargin + (spaceSize * yLoc) + 2,
      spaceSize - 4,
      spaceSize - 4,
    );
    this.ctx.fill();
    this.ctx.stroke();
  };

  drawWall(plane, xLoc, yLoc, leftMargin, topMargin, spaceSize) {
    const wallX = plane.x + leftMargin + (spaceSize * xLoc);
    const wallY = plane.y + topMargin + (spaceSize * yLoc);
    const cornerRadius = spaceSize * 0.2; // Adjust for more or less rounded corners

    this.ctx.fillStyle = Colors.gray;
    this.ctx.strokeStyle = Colors.black;
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    this.ctx.moveTo(wallX + cornerRadius, wallY);
    this.ctx.lineTo(wallX + spaceSize - cornerRadius, wallY);
    this.ctx.quadraticCurveTo(wallX + spaceSize, wallY, wallX + spaceSize, wallY + cornerRadius);
    this.ctx.lineTo(wallX + spaceSize, wallY + spaceSize - cornerRadius);
    this.ctx.quadraticCurveTo(wallX + spaceSize, wallY + spaceSize, wallX + spaceSize - cornerRadius, wallY + spaceSize);
    this.ctx.lineTo(wallX + cornerRadius, wallY + spaceSize);
    this.ctx.quadraticCurveTo(wallX, wallY + spaceSize, wallX, wallY + spaceSize - cornerRadius);
    this.ctx.lineTo(wallX, wallY + cornerRadius);
    this.ctx.quadraticCurveTo(wallX, wallY, wallX + cornerRadius, wallY);
    this.ctx.closePath();

    this.ctx.fill();
    this.ctx.stroke();
  }

  drawKey(letter, centerX, centerY, size, keyColor, textColor) {
    const cornerRadius = size * 0.2;
    const keyX = centerX - size / 2;
    const keyY = centerY - size / 2;

    this.ctx.fillStyle = keyColor;
    this.ctx.strokeStyle = Colors.black;
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    this.ctx.moveTo(keyX + cornerRadius, keyY);
    this.ctx.lineTo(keyX + size - cornerRadius, keyY);
    this.ctx.quadraticCurveTo(keyX + size, keyY, keyX + size, keyY + cornerRadius);
    this.ctx.lineTo(keyX + size, keyY + size - cornerRadius);
    this.ctx.quadraticCurveTo(keyX + size, keyY + size, keyX + size - cornerRadius, keyY + size);
    this.ctx.lineTo(keyX + cornerRadius, keyY + size);
    this.ctx.quadraticCurveTo(keyX, keyY + size, keyX, keyY + size - cornerRadius);
    this.ctx.lineTo(keyX, keyY + cornerRadius);
    this.ctx.quadraticCurveTo(keyX, keyY, keyX + cornerRadius, keyY);
    this.ctx.closePath();

    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = textColor;
    this.ctx.font = `bold ${size * 0.6}px Verdana`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(letter, centerX, centerY);

    // Reset alignment
    this.ctx.textAlign = 'start';
    this.ctx.textBaseline = 'alphabetic';
  }

  drawArrow(centerX, centerY, size, direction, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    if (direction === 'up') {
      this.ctx.moveTo(centerX, centerY - size / 2);
      this.ctx.lineTo(centerX + size / 2, centerY + size / 2);
      this.ctx.lineTo(centerX - size / 2, centerY + size / 2);
    } else if (direction === 'down') {
      this.ctx.moveTo(centerX, centerY + size / 2);
      this.ctx.lineTo(centerX + size / 2, centerY - size / 2);
      this.ctx.lineTo(centerX - size / 2, centerY - size / 2);
    } else if (direction === 'left') {
      this.ctx.moveTo(centerX - size / 2, centerY);
      this.ctx.lineTo(centerX + size / 2, centerY - size / 2);
      this.ctx.lineTo(centerX + size / 2, centerY + size / 2);
    } else { // right
      this.ctx.moveTo(centerX + size / 2, centerY);
      this.ctx.lineTo(centerX - size / 2, centerY - size / 2);
      this.ctx.lineTo(centerX - size / 2, centerY + size / 2);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawHelperAxis(plane, leftMargin, topMargin, spaceSize, horizColor, horizText, vertColor, vertText) {
    // x axis
    const horizontal = {
      xStart: plane.x + (leftMargin * 2) + this.spaces * spaceSize,
      yStart: plane.y + topMargin + spaceSize * this.spaces,
      xEnd: plane.x + (leftMargin * 2) + (this.spaces * 1.5) * spaceSize,
      yEnd: plane.y + topMargin + spaceSize * this.spaces,
    };

    if (plane.horzAxis === 'w' && plane.vertAxis === 'y') {
      this._drawHorizontalAxisWithIndicators(plane, leftMargin, spaceSize, horizontal, horizColor, horizText, 'Z', 'C');
    } else {
      this.drawLines([horizontal], horizColor, 2);
      this.ctx.fillStyle = horizColor;
      this.ctx.font = `${spaceSize}px Verdana`;
      this.ctx.fillText(horizText, horizontal.xStart + spaceSize * 2, horizontal.yEnd - spaceSize/2);
    }

    //  y axis
    const verticle = {
      xStart: plane.x + (leftMargin * 2) + this.spaces * spaceSize,
      yStart: plane.y + topMargin + spaceSize * this.spaces,
      xEnd: plane.x + (leftMargin * 2) + this.spaces * spaceSize,
      yEnd: plane.y + topMargin + spaceSize * (this.spaces / 2),
    };

    if (plane.vertAxis === 'x' && plane.horzAxis === 'z') { // this is specific to zxPlane
      this._drawVerticalAxisWithIndicators(plane, topMargin, spaceSize, verticle, vertColor, vertText, 'Q', 'A');
    } else if (plane.vertAxis === 'y' && plane.horzAxis === 'x') { // this is specific to xyPlane
      this._drawVerticalAxisWithIndicators(plane, topMargin, spaceSize, verticle, vertColor, vertText, 'W', 'S');
    } else if (plane.vertAxis === 'z' && plane.horzAxis === 'y') { // this is specific to yzPlane
      this._drawVerticalAxisWithIndicators(plane, topMargin, spaceSize, verticle, vertColor, vertText, 'E', 'D');
    } else {
      this.drawLines([verticle], vertColor, 2);

      this.ctx.fillStyle = vertColor;
      this.ctx.font = `${spaceSize}px Verdana`;
      this.ctx.fillText(vertText, verticle.xEnd + spaceSize/2, verticle.yStart - spaceSize * 2.5);
    }
  };

  _drawVerticalAxisWithIndicators(plane, topMargin, spaceSize, verticle, vertColor, vertText, upKey, downKey) {
    // The newly extended axis line should extend upwards until it is at the same height as the play field to its left
    const extendedYEnd = plane.y + topMargin;
    const line = {xStart: verticle.xEnd, yStart: verticle.yStart, xEnd: verticle.xEnd, yEnd: extendedYEnd };
    this.drawLines([line], vertColor, 2);

    const yCenter = (extendedYEnd + verticle.yStart) / 2;

    // x: loc indicator should have some space on the left side so it not touching the axis line
    const textX = verticle.xEnd + spaceSize / 2;

    this.ctx.fillStyle = vertColor;
    this.ctx.textBaseline = 'middle';

    // The A and Q key indicator should be spaced a bit above and below the x indicator, not at the ends of the axis
    const keySize = spaceSize * 1.5;
    const keyCenterX = textX + keySize / 2;
    // Up key
    this.drawKey(upKey, keyCenterX, yCenter - spaceSize * 1.75, keySize, Colors.planeBackground, Colors.black);

    // axis text
    this.ctx.font = `${spaceSize}px Verdana`;
    this.ctx.fillStyle = vertColor;
    this.ctx.fillText(vertText, textX, yCenter);

    // Down key
    this.drawKey(downKey, keyCenterX, yCenter + spaceSize * 1.75, keySize, Colors.planeBackground, Colors.black);

    this.ctx.textBaseline = 'alphabetic'; // reset

    const arrowSize = spaceSize * 0.75;
    const arrowGap = spaceSize * 0.25;

    // Up arrow above Q
    const upKeyTop = (yCenter - spaceSize * 1.75) - keySize / 2;
    const upArrowCenterY = upKeyTop - arrowGap - arrowSize / 2;
    this.drawArrow(keyCenterX, upArrowCenterY, arrowSize, 'up', vertColor);

    // Down arrow below A
    const downKeyBottom = (yCenter + spaceSize * 1.75) + keySize / 2;
    const downArrowCenterY = downKeyBottom + arrowGap + arrowSize / 2;
    this.drawArrow(keyCenterX, downArrowCenterY, arrowSize, 'down', vertColor);
  }

  _drawHorizontalAxisWithIndicators(plane, leftMargin, spaceSize, horizontal, horizColor, horizText, leftKey, rightKey) {
    const extendedXEnd = plane.x + plane.width - leftMargin;
    const line = { ...horizontal, xEnd: extendedXEnd };
    this.drawLines([line], horizColor, 2);

    const xCenter = (line.xStart + line.xEnd) / 2;
    const indicatorY = line.yStart - spaceSize * 1.5;

    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // axis text
    this.ctx.font = `${spaceSize}px Verdana`;
    this.ctx.fillStyle = horizColor;
    this.ctx.fillText(horizText, xCenter, indicatorY);

    const keySize = spaceSize * 1.5;
    const keyAndTextSpacing = spaceSize * 2;

    // Left key
    const leftKeyCenterX = xCenter - keyAndTextSpacing;
    this.drawKey(leftKey, leftKeyCenterX, indicatorY, keySize, Colors.planeBackground, Colors.black);

    // Right key
    const rightKeyCenterX = xCenter + keyAndTextSpacing;
    this.drawKey(rightKey, rightKeyCenterX, indicatorY, keySize, Colors.planeBackground, Colors.black);

    this.ctx.textAlign = 'start';
    this.ctx.textBaseline = 'alphabetic'; // reset

    const arrowSize = spaceSize * 0.75;
    const arrowGap = spaceSize * 0.25;

    // Left arrow
    const leftKeyLeft = leftKeyCenterX - keySize / 2;
    const leftArrowCenterX = leftKeyLeft - arrowGap - arrowSize / 2;
    this.drawArrow(leftArrowCenterX, indicatorY, arrowSize, 'left', horizColor);

    // Right arrow
    const rightKeyRight = rightKeyCenterX + keySize / 2;
    const rightArrowCenterX = rightKeyRight + arrowGap + arrowSize / 2;
    this.drawArrow(rightArrowCenterX, indicatorY, arrowSize, 'right', horizColor);
  }

  drawLines(lines, color, lineWidth) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();

    lines.forEach(line => {
      this.ctx.moveTo(line.xStart, line.yStart);
      this.ctx.lineTo(line.xEnd, line.yEnd);
    });

    this.ctx.stroke();
  }

  drawGrid(plane, leftMargin, topMargin, spaceSize) {
    this.ctx.fillStyle = Colors.planeBackground;
    this.ctx.fillRect(
      plane.x + leftMargin,
      plane.y + topMargin,
      this.spaces * spaceSize,
      this.spaces * spaceSize
    );

    const grid = [];
    for (let i = 0; i < this.spaces + 1; i++) { // 11 lines for 10 space grid
      grid.push({
        xStart: plane.x + leftMargin,
        yStart: plane.y + topMargin + spaceSize * i,
        xEnd: plane.x + leftMargin + this.spaces * spaceSize,
        yEnd: plane.y + topMargin + spaceSize * i,
      });

      grid.push({
        xStart: plane.x + leftMargin + spaceSize * i,
        yStart: plane.y + topMargin,
        xEnd: plane.x + leftMargin  + spaceSize * i,
        yEnd: plane.y + topMargin + this.spaces * spaceSize,
      });
    }

    this.drawLines(grid, Colors.gray, 1);

    this.ctx.strokeStyle = Colors.black;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      plane.x + leftMargin,
      plane.y + topMargin,
      this.spaces * spaceSize,
      this.spaces * spaceSize
    );
  };

  drawGoalDirectionLines(planeLayout, leftMargin, topMargin, spaceSize, nowTime) {
    const goalHorz = this.state.goal[planeLayout.horzAxis];
    const goalVert = this.state.goal[planeLayout.vertAxis];

    const x = planeLayout.x + leftMargin + (goalHorz * spaceSize) + (spaceSize / 2);
    const y = planeLayout.y + topMargin + ((this.spaces - 1 - goalVert) * spaceSize) + (spaceSize / 2);

    const lines = [
      { xStart: x, yStart: planeLayout.y + topMargin, xEnd: x, yEnd: planeLayout.y + topMargin + (this.spaces * spaceSize) },
      { xStart: planeLayout.x + leftMargin, yStart: y, xEnd: planeLayout.x + leftMargin + (this.spaces * spaceSize), yEnd: y },
    ];

    const pulseFactor = (Math.sin(nowTime / 400) + 1) / 2;
    const color = interpolateColor(Colors.goalDirection, Colors.goalDirectionPulse, pulseFactor);

    this.drawLines(lines, color, 3);
  }

  drawInfoPanel() {
    this.ctx.fillStyle = Colors.infoPanel;
    this.ctx.fillRect(
      this.viewConfig.infoPanel.x,
      this.viewConfig.infoPanel.y,
      this.viewConfig.infoPanel.width,
      this.viewConfig.infoPanel.height
    );

    this.ctx.strokeStyle = Colors.gray;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.viewConfig.infoPanel.x, this.viewConfig.infoPanel.height);
    this.ctx.lineTo(this.viewConfig.infoPanel.width, this.viewConfig.infoPanel.height);
    this.ctx.stroke();

    const padding = 20;
    const rightSideStart = this.viewConfig.infoPanel.width - 400;
    const coordsStart = padding;
    const goalStart = padding + 300;
    const fpsStart = rightSideStart;
    const cursorStart = rightSideStart + 140;

    this.ctx.fillStyle = Colors.black;
    this.ctx.font = `bold ${(this.viewConfig.infoPanel.height - this.viewConfig.infoPanel.y) * .5}px Arial`;

    this.ctx.fillText(
      `Player: [ x: ${this.state.player.x}, y: ${this.state.player.y}, z: ${this.state.player.z}, w: ${this.state.player.w} ]`,
      this.viewConfig.infoPanel.x + coordsStart,
      this.viewConfig.infoPanel.y + (this.viewConfig.infoPanel.height / 2) + 5
    );

    this.ctx.fillText(
      `Goal: [ x: ${this.state.goal.x}, y: ${this.state.goal.y}, z: ${this.state.goal.z}, w: ${this.state.goal.w} ]`,
      this.viewConfig.infoPanel.x + goalStart,
      this.viewConfig.infoPanel.y + (this.viewConfig.infoPanel.height / 2) + 5
    );

    this.ctx.fillText(
      `${this.state.infoPanel.fps} FPS`,
      this.viewConfig.infoPanel.x + fpsStart,
      this.viewConfig.infoPanel.y + (this.viewConfig.infoPanel.height / 2) + 5
    );

    this.ctx.fillText(
      `cursor click: (x: ${this.state.infoPanel.mouseX}, y: ${this.state.infoPanel.mouseY})`,
      this.viewConfig.infoPanel.x + cursorStart,
      this.viewConfig.infoPanel.y + (this.viewConfig.infoPanel.height / 2) + 5
    );
  }

  drawPlane(planeLayout, nowTime) {
    const leftMargin = planeLayout.spacing;
    const topMargin = planeLayout.spacing;
    const spaceSize = planeLayout.spacing;

    this.drawHelperAxis(
      planeLayout,
      leftMargin,
      topMargin,
      spaceSize,
      this.viewConfig.colorMap[planeLayout.horzAxis],
      `${planeLayout.horzAxis}: ${this.state.player[planeLayout.horzAxis]}`,
      this.viewConfig.colorMap[planeLayout.vertAxis],
      `${planeLayout.vertAxis}: ${this.state.player[planeLayout.vertAxis]}`,
    );

    this.drawGrid(planeLayout, leftMargin, topMargin, spaceSize);
    this.drawGoalDirectionLines(planeLayout, leftMargin, topMargin, spaceSize, nowTime);

    for (let vert = 0; vert < this.spaces; vert++) {
      for (let horz = 0; horz < this.spaces; horz++) {
        const space = {...this.state.player};
        space[planeLayout.vertAxis] = vert;
        space[planeLayout.horzAxis] = horz;
        if (!this.map.isSpaceOpen(space)) {
          this.drawWall(
            planeLayout,
            horz, // correct with zero on the left
            this.spaces - 1 - vert, // invert to have 0 on bottom
            leftMargin,
            topMargin,
            spaceSize,
          );
        }
      }
    }

    // draw player
    // horizontal x Axis is correct with zero left
    // invert vertical y axis to have zero on bottom
    const playerXLoc = this.state.player[planeLayout.horzAxis];
    const playerYLoc = this.spaces - 1 - this.state.player[planeLayout.vertAxis];
    this.drawPlayer(planeLayout, playerXLoc, playerYLoc, leftMargin, topMargin, spaceSize);

    // draw goal
    const a = this.state.player[planeLayout.otherAxes[0]];
    const b = this.state.player[planeLayout.otherAxes[1]];
    const goalA = this.state.goal[planeLayout.otherAxes[0]];
    const goalB = this.state.goal[planeLayout.otherAxes[1]];
    if (a === goalA && b === goalB) {
      const goalXLoc = this.state.goal[planeLayout.horzAxis];
      const goalYLoc = this.spaces - 1 - this.state.goal[planeLayout.vertAxis];
      this.drawGoal(planeLayout, goalXLoc, goalYLoc, leftMargin, topMargin, spaceSize);
    }

    planeLayout.dirty = false;
  }
}
