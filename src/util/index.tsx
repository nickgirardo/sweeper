import { difference, intersection } from "./array.js";

export const range = (n: number): Array<number> => [...new Array(n).keys()];

export const classNames = (...rest: Array<string | false>): string =>
  rest.filter((arg: string | false): arg is string => arg !== false).join(" ");

export const assertNever = <T,>(x: never): T => {
  throw new Error("Received never: " + x);
};

// Wichman-Hill PRNG
export class Rand {
  x: number;
  y: number;
  z: number;

  constructor(seed: number) {
    // NOTE the 0.1 and -0.1 constants are to avoid setting all of the inital seeds to 0
    this.x = Math.floor((171 * (seed + 0.1)) % 30269);
    this.y = Math.floor((172 * (seed - 0.1)) % 30307);
    this.z = Math.floor((170 * (seed + 0.1)) % 30323);
  }

  next(): number {
    this.x = (171 * this.x) % 30269;
    this.y = (172 * this.y) % 30307;
    this.z = (170 * this.z) % 30323;
    return Math.abs(
      (this.x / 30269.0 + this.y / 30307.0 + this.z / 30323.0) % 1.0
    );
  }
}

// Get ids of all neighboring tiles to a given tile
// The list of neighbors is sorted in numerically ascending order
export const getNeighbors = (
  tile: number,
  width: number,
  height: number
): Array<number> => {
  const x = tile % width;
  const y = (tile - x) / width;

  return [
    // NW tile
    x !== 0 && y !== 0 && tile - width - 1,
    // North tile
    y !== 0 && tile - width,
    // NE tile
    x !== width - 1 && y !== 0 && tile - width + 1,
    // West tile
    x !== 0 && tile - 1,
    // East tile
    x !== width - 1 && tile + 1,
    // SW tile
    x !== 0 && y !== height - 1 && tile + width - 1,
    // South tile
    y !== height - 1 && tile + width,
    // SE tile
    x !== width - 1 && y !== height - 1 && tile + width + 1,
  ].filter((n): n is number => n !== false);
};

export const checkTiles = (
  tile: number,
  width: number,
  height: number,
  checked: Array<number>,
  flagged: Array<number>,
  neighbors: Array<number>
): Array<number> => {
  const go = (tile: number): void => {
    if (newTiles.includes(tile)) return;

    newTiles.push(tile);

    // If there are no neighboring mines automatically check neighboring mines
    if (neighbors[tile] === 0) getNeighbors(tile, width, height).forEach(go);
  };

  if (flagged.includes(tile)) return checked;

  const newTiles = [...checked];

  if (newTiles.includes(tile)) {
    const flaggedNeighbors = intersection(
      getNeighbors(tile, width, height),
      flagged
    );

    if (neighbors[tile] === flaggedNeighbors.length) {
      const unflaggedNeighbors = difference(
        getNeighbors(tile, width, height),
        flagged
      );
      unflaggedNeighbors.forEach(go);
      return newTiles;
    }
    return checked;
  }

  go(tile);

  return newTiles;
};
