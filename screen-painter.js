import { Colors } from './helpers.js'

export class ScreenPainter {
  constructor(state, viewConfig, ctx, map) {
    this.state = state;
    this.viewConfig = viewConfig;
    this.ctx = ctx;
    this.map = map;
  }

  render() {
    this.infoPanel();
    this.zxPlane();
    this.xyPlane();
    this.yzPlane();
  }

  isSpaceOpen(x, y, z) {
    return this.map.getSpaceContents(x, y, z) === '.';
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
      xStart: plane.x + (leftMargin * 2) + this.viewConfig.map.spaces * spaceSize,
      yStart: plane.y + topMargin + spaceSize * this.viewConfig.map.spaces,
      xEnd: plane.x + (leftMargin * 2) + (this.viewConfig.map.spaces * 1.5) * spaceSize,
      yEnd: plane.y + topMargin + spaceSize * this.viewConfig.map.spaces,
    };

    this.drawLines([horizontal], horizColor, 1);

    this.ctx.fillStyle = horizColor;
    this.ctx.font = `${spaceSize * .75}px Verdana`;
    this.ctx.fillText(horizText, horizontal.xStart + spaceSize * 2, horizontal.yEnd - spaceSize/2);

    //  y axis
    const verticle = {
      xStart: plane.x + (leftMargin * 2) + this.viewConfig.map.spaces * spaceSize,
      yStart: plane.y + topMargin + spaceSize * this.viewConfig.map.spaces,
      xEnd: plane.x + (leftMargin * 2) + this.viewConfig.map.spaces * spaceSize,
      yEnd: plane.y + topMargin + spaceSize * (this.viewConfig.map.spaces / 2),
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
    for (let i = 0; i < this.viewConfig.map.spaces + 1; i++) { // 11 lines for 10 space grid
      grid.push({
        xStart: plane.x + leftMargin,
        yStart: plane.y + topMargin + spaceSize * i,
        xEnd: plane.x + leftMargin + this.viewConfig.map.spaces * spaceSize,
        yEnd: plane.y + topMargin + spaceSize * i,
      });

      grid.push({
        xStart: plane.x + leftMargin + spaceSize * i,
        yStart: plane.y + topMargin,
        xEnd: plane.x + leftMargin  + spaceSize * i,
        yEnd: plane.y + topMargin + this.viewConfig.map.spaces * spaceSize,
      });
    }

    this.drawLines(grid, Colors.black, 1);
  };

  infoPanel() {
    if (!this.state.infoPanel.dirty) return;

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

    this.state.infoPanel.dirty = false;
  }

  zxPlane() {
    if (!this.state.zxPlane.dirty) return;

    // indent all clears to avoid aliasing border lines due to thickness
    this.ctx.clearRect(
      this.viewConfig.zxPlane.x + this.viewConfig.map.clearMargin,
      this.viewConfig.zxPlane.y + this.viewConfig.map.clearMargin,
      this.viewConfig.zxPlane.width - this.viewConfig.map.clearMargin * 2,
      this.viewConfig.zxPlane.height - this.viewConfig.map.clearMargin * 2
    );

    const leftMargin = this.viewConfig.zxPlane.spacing;
    const topMargin = this.viewConfig.zxPlane.spacing;
    const spaceSize = this.viewConfig.zxPlane.spacing;

    this.drawGrid(this.viewConfig.zxPlane, leftMargin, topMargin, spaceSize);

    // draw player
    // z is correct with zero left
    // invert x to have zero on bottom
    const xLoc = this.state.player.z;
    const yLoc = this.viewConfig.map.spaces - 1 - this.state.player.x;
    this.drawPlayer(this.viewConfig.zxPlane, xLoc, yLoc, leftMargin, topMargin, spaceSize);

    for (let x = 0; x < this.viewConfig.map.spaces; x++) {
      for (let z = 0; z < this.viewConfig.map.spaces; z++) {
        if (!this.isSpaceOpen(x, this.state.player.y, z)) {
          this.drawWall(
            this.viewConfig.zxPlane,
            z, // z is correct with zero left
            this.viewConfig.map.spaces - 1 - x, // invert x to have zero on bottom
            leftMargin,
            topMargin,
            spaceSize
          );
        }
      }
    }

    this.drawHelperAxis(
      this.viewConfig.zxPlane,
      leftMargin,
      topMargin,
      spaceSize,
      Colors.purple,
      `z: ${this.state.player.z}`,
      Colors.red,
      `x: ${this.state.player.x}`,
    );

    this.state.zxPlane.dirty = false;
  }

  xyPlane() {
    if (!this.state.xyPlane.dirty) return;

    // indent all clears to avoid aliasing border lines due to thickness
    this.ctx.clearRect(
      this.viewConfig.xyPlane.x + this.viewConfig.map.clearMargin,
      this.viewConfig.xyPlane.y + this.viewConfig.map.clearMargin,
      this.viewConfig.xyPlane.width - this.viewConfig.map.clearMargin * 2,
      this.viewConfig.xyPlane.height - this.viewConfig.map.clearMargin * 2
    );

    const leftMargin = this.viewConfig.xyPlane.spacing;
    const topMargin = this.viewConfig.xyPlane.spacing;
    const spaceSize = this.viewConfig.xyPlane.spacing;

    this.drawGrid(this.viewConfig.xyPlane, leftMargin, topMargin, spaceSize);

    // draw player
    // x is correct with zero left
    // invert y to have zero on bottom
    const xLoc = this.state.player.x;
    const yLoc = this.viewConfig.map.spaces - 1 - this.state.player.y;
    this.drawPlayer(this.viewConfig.xyPlane, xLoc, yLoc, leftMargin, topMargin, spaceSize);

    for (let y = 0; y < this.viewConfig.map.spaces; y++) {
      for (let x = 0; x < this.viewConfig.map.spaces; x++) {
        if (!this.isSpaceOpen(x, y, this.state.player.z)) {
          this.drawWall(
            this.viewConfig.xyPlane,
            x, // x is correct with zero left
            this.viewConfig.map.spaces - 1 - y, // invert y to have zero on bottom
            leftMargin,
            topMargin,
            spaceSize
          );
        }
      }
    }

    this.drawHelperAxis(
      this.viewConfig.xyPlane,
      leftMargin,
      topMargin,
      spaceSize,
      Colors.red,
      `x: ${this.state.player.x}`,
      Colors.green,
      `y: ${this.state.player.y}`,
    );

    this.state.xyPlane.dirty = false;
  }

  yzPlane() {
    if (!this.state.yzPlane.dirty) return;

    this.ctx.clearRect(
      this.viewConfig.yzPlane.x + this.viewConfig.map.clearMargin,
      this.viewConfig.yzPlane.y + this.viewConfig.map.clearMargin,
      this.viewConfig.yzPlane.width - this.viewConfig.map.clearMargin * 2,
      this.viewConfig.yzPlane.height - this.viewConfig.map.clearMargin * 2
    );

    const leftMargin = this.viewConfig.yzPlane.spacing;
    const topMargin = this.viewConfig.yzPlane.spacing;
    const spaceSize = this.viewConfig.yzPlane.spacing;

    this.drawGrid(this.viewConfig.yzPlane, leftMargin, topMargin, spaceSize);

    // draw player
    // y is correct with zero left
    // invert z to have zero on bottom
    const yLoc = this.state.player.y;
    const zLoc = this.viewConfig.map.spaces - 1 - this.state.player.z;
    this.drawPlayer(this.viewConfig.yzPlane, yLoc, zLoc, leftMargin, topMargin, spaceSize);

    for (let z = 0; z < this.viewConfig.map.spaces; z++) {
      for (let y = 0; y < this.viewConfig.map.spaces; y++) {
        if (!this.isSpaceOpen(this.state.player.x, y, z)) {
          this.drawWall(
            this.viewConfig.yzPlane,
            y, // y is correct with zero left
            this.viewConfig.map.spaces - 1 - z, // invert z to have zero on bottom
            leftMargin,
            topMargin,
            spaceSize
          );
        }
      }
    }

    this.drawHelperAxis(
      this.viewConfig.yzPlane,
      leftMargin,
      topMargin,
      spaceSize,
      Colors.green,
      `y: ${this.state.player.y}`,
      Colors.purple,
      `z: ${this.state.player.z}`,
    );

    this.state.yzPlane.dirty = false;
  }
}
