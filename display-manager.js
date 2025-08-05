export class DisplayManager {
  colors = {
    black: '#000000',
    gray: '#808080',
    blue: '#0000ff',
    green: '#2eb52a',
    red: '#993000',
    purple: '#9858b8',
  }

  constructor(state, viewConfig, ctx) {
    this.state = state;
    this.viewConfig = viewConfig;
    this.ctx = ctx;
  }

  render() {
    this.infoPanel();
  }

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
    this.ctx.fillStyle = this.colors.black;
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
}
