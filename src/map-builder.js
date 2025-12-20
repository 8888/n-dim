export class MapBuilder {
  constructor(spaces, dimensions) {
    this.spaces = spaces;
    this.dimensions = dimensions;
  }

  newMap() {
    return this.createMap(this.dimensions, this.spaces);
  }

  createMap(dimensions, spaces) {
    const wallPercent = 0.6;
    const fullMap = [];
    for (let i = 0; i < spaces ** dimensions; i++) {
      const space = Math.random() >= wallPercent ? '#' : '.';
      fullMap.push(space);
    }
    return new Map(fullMap, this.spaces);
  }
}

/*
spaces = 3
3x3x3 cube
Take space you need to look up, say {x: 0, y: 1, z: 2}
Find the index: x + y*spaces + z*spaces*spaces
so: 0 + 1*3 + 2*3*3 = 0+3+18 = 21
map[21] = space contents for {x: 0, y:1, z: 2}
*/
class Map {
  constructor(full, spaces) {
    this.full = full;
    this.spaces = spaces;
    // set start point empty
    this.full[this.getIndex(
      Math.floor(this.spaces / 2),
      Math.floor(this.spaces / 2),
      Math.floor(this.spaces / 2),
      Math.floor(this.spaces / 2)
    )] = '.';
  }

  getIndex(x, y, z, w) {
    return x + (y * this.spaces) + (z * this.spaces * this.spaces) + (w * this.spaces * this.spaces * this.spaces);
  }

  getSpaceContents(x, y, z, w) {
    return this.full[this.getIndex(x, y, z, w)];
  }

  isSpaceInBounds({x, y, z, w}) {
    return (
      x >= 0 && x <= this.spaces - 1 &&
      y >= 0 && y <= this.spaces - 1 &&
      z >= 0 && z <= this.spaces - 1 &&
      w >= 0 && w <= this.spaces - 1
    );
  }

  isSpaceOpen({x, y, z, w}) {
    return this.getSpaceContents(x, y, z, w) === '.';
  }
}
