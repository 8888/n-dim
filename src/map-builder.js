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
    const map = new Map(fullMap, this.spaces);

    // set start point empty
    const startPosition = {
      x: Math.floor(this.spaces / 2),
      y: Math.floor(this.spaces / 2),
      z: Math.floor(this.spaces / 2),
      w: Math.floor(this.spaces / 2),
    };
    map.full[map.getIndex(startPosition.x, startPosition.y, startPosition.z, startPosition.w)] = '.';

    const goal = this.createGoal(map, startPosition);

    return { map, goal };
  }

  createGoal(map, startPosition) {
    const reachableEmptySpaces = this.findReachableEmptySpaces(map, startPosition);
    if (reachableEmptySpaces.length === 0) {
      // This should be rare, but if there are no reachable empty spaces,
      // we can just return the start position as the goal.
      return startPosition;
    }
    const goalIndex = Math.floor(Math.random() * reachableEmptySpaces.length);
    return reachableEmptySpaces[goalIndex];
  }

  findReachableEmptySpaces(map, startPosition) {
    const queue = [startPosition];
    const visited = new Set([map.getIndex(startPosition.x, startPosition.y, startPosition.z, startPosition.w)]);
    const reachable = [];

    while(queue.length > 0) {
      const currentPosition = queue.shift();
      reachable.push(currentPosition);

      const neighbors = map.getNeighbors(currentPosition);
      for (const neighbor of neighbors) {
        const neighborIndex = map.getIndex(neighbor.x, neighbor.y, neighbor.z, neighbor.w);
        if (!visited.has(neighborIndex) && map.isSpaceOpen(neighbor)) {
          visited.add(neighborIndex);
          queue.push(neighbor);
        }
      }
    }

    return reachable;
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

  getPosition(index) {
    const w = Math.floor(index / (this.spaces * this.spaces * this.spaces));
    index -= w * this.spaces * this.spaces * this.spaces;
    const z = Math.floor(index / (this.spaces * this.spaces));
    index -= z * this.spaces * this.spaces;
    const y = Math.floor(index / this.spaces);
    index -= y * this.spaces;
    const x = index;
    return {x, y, z, w};
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

  getNeighbors({x, y, z, w}) {
    const neighbors = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          for (let dw = -1; dw <= 1; dw++) {
            if (dx === 0 && dy === 0 && dz === 0 && dw === 0) {
              continue;
            }
            if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) + Math.abs(dw) > 1) {
              continue;
            }
            const neighbor = {x: x + dx, y: y + dy, z: z + dz, w: w + dw};
            if (this.isSpaceInBounds(neighbor)) {
              neighbors.push(neighbor);
            }
          }
        }
      }
    }
    return neighbors;
  }
}
