import { Colors } from './helpers.js'

export class ViewConfig {
  colorMap = {
    x: Colors.red,
    y: Colors.green,
    z: Colors.purple,
    w: Colors.yellow,
  };

  constructor(spaces, dimensions) {
    this.map = { spaces, dimensions, clearMargin: 5 };
    this.infoPanel = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      dirty: true
    };
    this.zxPlane = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      spacing: 0,
      horzAxis: 'z',
      vertAxis: 'x',
      dirty: true,
    };
    this.xyPlane = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      spacing: 0,
      horzAxis: 'x',
      vertAxis: 'y',
      dirty: true,
    };
    this.yzPlane = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      spacing: 0,
      horzAxis: 'y',
      vertAxis: 'z',
      dirty: true,
    };
    this.wxPlane = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      spacing: 0,
      horzAxis: 'w',
      vertAxis: 'x',
      dirty: true,
    };
    this.wyPlane = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      spacing: 0,
      horzAxis: 'w',
      vertAxis: 'y',
      dirty: true,
    };
    this.wzPlane = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      spacing: 0,
      horzAxis: 'w',
      vertAxis: 'z',
      dirty: true,
    };

    this.layout = [
      [this.zxPlane, this.xyPlane, this.yzPlane],
      [this.wxPlane, this.wyPlane, this.wzPlane],
    ];

    this.allPlanes = [
      this.zxPlane, this.xyPlane, this.yzPlane,
      this.wxPlane, this.wyPlane, this.wzPlane,
    ];
  }
}
