import { Colors } from './helpers.js'

export class ViewConfig {
  colorMap = {
    x: Colors.xAxis,
    y: Colors.yAxis,
    z: Colors.zAxis,
    w: Colors.wAxis,
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
      otherAxes: ['y', 'w'],
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
      otherAxes: ['z', 'w'],
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
      otherAxes: ['x', 'w'],
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
      otherAxes: ['y', 'z'],
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
      otherAxes: ['x', 'z'],
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
      otherAxes: ['x', 'y'],
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
