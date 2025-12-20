import { ViewConfig } from './view-config.js';
import { Colors } from './helpers.js'
import { Events } from './event-bus.js';

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

  render() {
    this.ctx.fillStyle = Colors.screenBackground;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawInfoPanel();
    this.viewConfig.allPlanes.forEach(plane => this.drawPlane(plane));
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
    this.ctx.fillStyle = Colors.blue;
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
    } else { // down
      this.ctx.moveTo(centerX, centerY + size / 2);
      this.ctx.lineTo(centerX + size / 2, centerY - size / 2);
      this.ctx.lineTo(centerX - size / 2, centerY - size / 2);
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

    this.drawLines([horizontal], horizColor, 2);

    this.ctx.fillStyle = horizColor;
    this.ctx.font = `${spaceSize}px Verdana`;
    this.ctx.fillText(horizText, horizontal.xStart + spaceSize * 2, horizontal.yEnd - spaceSize/2);

    //  y axis
    const verticle = {
      xStart: plane.x + (leftMargin * 2) + this.spaces * spaceSize,
      yStart: plane.y + topMargin + spaceSize * this.spaces,
      xEnd: plane.x + (leftMargin * 2) + this.spaces * spaceSize,
      yEnd: plane.y + topMargin + spaceSize * (this.spaces / 2),
    };

    if (plane.vertAxis === 'x' && plane.horzAxis === 'z') { // this is specific to zxPlane
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
      // Q key
      this.drawKey('Q', keyCenterX, yCenter - spaceSize * 1.75, keySize, Colors.planeBackground, Colors.black);

      // x: loc
      this.ctx.font = `${spaceSize}px Verdana`;
      this.ctx.fillStyle = vertColor;
      this.ctx.fillText(vertText, textX, yCenter);

      // A key
      this.drawKey('A', keyCenterX, yCenter + spaceSize * 1.6, keySize, Colors.planeBackground, Colors.black);
      
      this.ctx.textBaseline = 'alphabetic'; // reset

      const arrowSize = spaceSize * 0.75;
      const arrowGap = spaceSize * 0.25;

      // Up arrow above Q
      const qKeyTop = (yCenter - spaceSize * 1.75) - keySize / 2;
      const upArrowCenterY = qKeyTop - arrowGap - arrowSize / 2;
      this.drawArrow(keyCenterX, upArrowCenterY, arrowSize, 'up', vertColor);

      // Down arrow below A
      const aKeyBottom = (yCenter + spaceSize * 1.6) + keySize / 2;
      const downArrowCenterY = aKeyBottom + arrowGap + arrowSize / 2;
      this.drawArrow(keyCenterX, downArrowCenterY, arrowSize, 'down', vertColor);


    } else {
      this.drawLines([verticle], vertColor, 2);

      this.ctx.fillStyle = vertColor;
      this.ctx.font = `${spaceSize}px Verdana`;
      this.ctx.fillText(vertText, verticle.xEnd + spaceSize/2, verticle.yStart - spaceSize * 2.5);
    }
  };

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
    const fpsStart = rightSideStart;
    const cursorStart = rightSideStart + 140;

    this.ctx.fillStyle = Colors.black;
    this.ctx.font = `bold ${(this.viewConfig.infoPanel.height - this.viewConfig.infoPanel.y) * .5}px Arial`;

    this.ctx.fillText(
      `[ x: ${this.state.player.x}, y: ${this.state.player.y}, z: ${this.state.player.z}, w: ${this.state.player.w} ]`,
      this.viewConfig.infoPanel.x + coordsStart,
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

  drawPlane(planeLayout) {
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

    // todo: we are passing the layout and then a prop from the layout 3 times
    this.drawGrid(planeLayout, leftMargin, topMargin, spaceSize);

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
    const xLoc = this.state.player[planeLayout.horzAxis];
    const yLoc = this.spaces - 1 - this.state.player[planeLayout.vertAxis];
    this.drawPlayer(planeLayout, xLoc, yLoc, leftMargin, topMargin, spaceSize);

    planeLayout.dirty = false;
  }
}
