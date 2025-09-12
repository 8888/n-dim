export class ViewConfig {
  /*
  Make this the display manager
  change the displayer manager to screen painter
  */
  constructor(spaces, dimensions) {
    this.map = { spaces, dimensions, clearMargin: 5 };
    this.infoPanel = { x: 0, y: 0, width: 0, height: 0 };
    this.zxPlane = { x: 0, y: 0, width: 0, height: 0, spacing: 0 };
    this.xyPlane = { x: 0, y: 0, width: 0, height: 0, spacing: 0 };
    this.yzPlane = { x: 0, y: 0, width: 0, height: 0, spacing: 0 };
  }

  updateInfoPanel(params = {x, y, width, height}) {
    this.infoPanel.x = params.x;
    this.infoPanel.y = params.y;
    this.infoPanel.width = params.width;
    this.infoPanel.height = params.height;
  }

  updateZXPlane(params = {x, y, width, height, spacing}) {
    this.zxPlane.x = params.x;
    this.zxPlane.y = params.y;
    this.zxPlane.width = params.width;
    this.zxPlane.height = params.height;
    this.zxPlane.spacing = params.spacing;
  }

  updateXYPlane(params = {x, y, width, height, spacing}) {
    this.xyPlane.x = params.x;
    this.xyPlane.y = params.y;
    this.xyPlane.width = params.width;
    this.xyPlane.height = params.height;
    this.xyPlane.spacing = params.spacing;
  }

  updateYZPlane(params = {x, y, width, height, spacing}) {
    this.yzPlane.x = params.x;
    this.yzPlane.y = params.y;
    this.yzPlane.width = params.width;
    this.yzPlane.height = params.height;
    this.yzPlane.spacing = params.spacing;
  }
}
