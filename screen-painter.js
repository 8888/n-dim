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

    this.drawStaticBorders();

    window.addEventListener('resize', this.resizeCanvas);

    this.eventBus.subscribe(Events.movePlayer, event => this.handleMove(event));
    // todo: not really using this
    this.eventBus.subscribe(Events.inspectPoint, () => this.viewConfig.infoPanel.dirty = true);
  }

  render() {
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

  drawStaticBorders() {
    const infoBorder = {
      xStart: this.viewConfig.infoPanel.x,
      yStart: this.viewConfig.infoPanel.height,
      xEnd: this.viewConfig.infoPanel.x + this.viewConfig.infoPanel.width,
      yEnd: this.viewConfig.infoPanel.height,
    }

    const xyBorder = {
      xStart: this.viewConfig.xyPlane.x,
      yStart: this.viewConfig.infoPanel.height + this.viewConfig.xyPlane.height,
      xEnd: this.viewConfig.xyPlane.x + this.viewConfig.xyPlane.width,
      yEnd: this.viewConfig.infoPanel.height + this.viewConfig.xyPlane.height,
    }

    this.drawLines([infoBorder, xyBorder], Colors.black, 2);
  }

  drawPlayer(plane, xLoc, yLoc, leftMargin, topMargin, spaceSize) {
    // x = horizontal axis
    // y = vertical axis
    // actual view on canvas, not player n-dim location
    // xLoc, yLoc are cell the player should be in from bottom left origin
    this.ctx.fillStyle = Colors.blue;
    this.ctx.beginPath();
    this.ctx.arc(
      plane.x + leftMargin + (spaceSize / 2) + (spaceSize * xLoc),
      plane.y + topMargin + (spaceSize / 2) + (spaceSize * yLoc),
      (spaceSize / 2) - 2,
      0,
      2 * Math.PI,
    );
    this.ctx.fill();
  };

  drawWall(plane, xLoc, yLoc, leftMargin, topMargin, spaceSize) {
    this.ctx.fillStyle = Colors.gray;
    this.ctx.fillRect(
      plane.x + leftMargin + (spaceSize * xLoc),
      plane.y + topMargin + (spaceSize * yLoc),
      spaceSize,
      spaceSize
    )
  }

  drawHelperAxis(plane, leftMargin, topMargin, spaceSize, horizColor, horizText, vertColor, vertText) {
    // x axis
    const horizontal = {
      xStart: plane.x + (leftMargin * 2) + this.spaces * spaceSize,
      yStart: plane.y + topMargin + spaceSize * this.spaces,
      xEnd: plane.x + (leftMargin * 2) + (this.spaces * 1.5) * spaceSize,
      yEnd: plane.y + topMargin + spaceSize * this.spaces,
    };

    this.drawLines([horizontal], horizColor, 1);

    this.ctx.fillStyle = horizColor;
    this.ctx.font = `${spaceSize * .75}px Verdana`;
    this.ctx.fillText(horizText, horizontal.xStart + spaceSize * 2, horizontal.yEnd - spaceSize/2);

    //  y axis
    const verticle = {
      xStart: plane.x + (leftMargin * 2) + this.spaces * spaceSize,
      yStart: plane.y + topMargin + spaceSize * this.spaces,
      xEnd: plane.x + (leftMargin * 2) + this.spaces * spaceSize,
      yEnd: plane.y + topMargin + spaceSize * (this.spaces / 2),
    };

    this.drawLines([verticle], vertColor, 1);

    this.ctx.fillStyle = vertColor;
    this.ctx.font = `${spaceSize * .75}px Verdana`;
    this.ctx.fillText(vertText, verticle.xEnd + spaceSize/2, verticle.yStart - spaceSize * 2.5);
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

    this.drawLines(grid, Colors.black, 1);
  };

  drawInfoPanel() {
    // indent all clears to avoid aliasing border lines due to thickness
    this.ctx.clearRect(
      this.viewConfig.infoPanel.x + this.viewConfig.map.clearMargin,
      this.viewConfig.infoPanel.y + this.viewConfig.map.clearMargin,
      this.viewConfig.infoPanel.width - this.viewConfig.map.clearMargin * 2,
      this.viewConfig.infoPanel.height - this.viewConfig.map.clearMargin * 2
    );

    const fpsStart = 20;
    const coordsStart = fpsStart + 140;
    const cursorStart = coordsStart + 200;
    this.ctx.fillStyle = Colors.black;
    this.ctx.font = `${(this.viewConfig.infoPanel.height - this.viewConfig.infoPanel.y) * .4}px Verdana`;

    this.ctx.fillText(
      `${this.state.infoPanel.fps} FPS`,
      this.viewConfig.infoPanel.x + fpsStart,
      this.viewConfig.infoPanel.y + (this.viewConfig.infoPanel.height / 2)
    );

    this.ctx.fillText(
      `[ x: ${this.state.player.x}, y: ${this.state.player.y}, z: ${this.state.player.z} ]`,
      this.viewConfig.infoPanel.x + coordsStart,
      this.viewConfig.infoPanel.y + (this.viewConfig.infoPanel.height / 2)
    );

    this.ctx.fillText(
      `cursor click: (x: ${this.state.infoPanel.mouseX}, y: ${this.state.infoPanel.mouseY})`,
      this.viewConfig.infoPanel.x + cursorStart,
      this.viewConfig.infoPanel.y + (this.viewConfig.infoPanel.height / 2)
    );
  }

  drawPlane(planeLayout) {
    // indent all clears to avoid aliasing border lines due to thickness
    this.ctx.clearRect(
      planeLayout.x + this.viewConfig.map.clearMargin,
      planeLayout.y + this.viewConfig.map.clearMargin,
      planeLayout.width - this.viewConfig.map.clearMargin * 2,
      planeLayout.height - this.viewConfig.map.clearMargin * 2
    );

    const leftMargin = planeLayout.spacing;
    const topMargin = planeLayout.spacing;
    const spaceSize = planeLayout.spacing;

    // todo: we are passing the layout and then a prop from the layout 3 times
    this.drawGrid(planeLayout, leftMargin, topMargin, spaceSize);

    // draw player
    // horizontal x Axis is correct with zero left
    // invert vertical y axis to have zero on bottom
    const xLoc = this.state.player[planeLayout.horzAxis];
    const yLoc = this.spaces - 1 - this.state.player[planeLayout.vertAxis];
    this.drawPlayer(planeLayout, xLoc, yLoc, leftMargin, topMargin, spaceSize);

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

    planeLayout.dirty = false;
  }
}
