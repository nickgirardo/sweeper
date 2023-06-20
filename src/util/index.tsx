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
  checkedTiles: Array<number>,
  flaggedTiles: Array<number>,
  neighbors: Array<number>
): Array<number> => {
  const go = (tile: number): void => {
    if (newTiles.includes(tile)) return;

    newTiles.push(tile);

    // If there are no neighboring mines automatically check neighboring mines
    if (neighbors[tile] === 0) getNeighbors(tile, width, height).forEach(go);
  };

  if (flaggedTiles.includes(tile)) return checkedTiles;

  const newTiles = [...checkedTiles];

  if (newTiles.includes(tile)) {
    const flaggedNeighbors = getNeighbors(tile, width, height).filter((n) =>
      flaggedTiles.includes(n)
    );

    if (neighbors[tile] === flaggedNeighbors.length) {
      const unflaggedNeighbors = getNeighbors(tile, width, height).filter(
        (n) => !flaggedTiles.includes(n)
      );
      unflaggedNeighbors.forEach(go);
      return newTiles;
    }
    return checkedTiles;
  }

  go(tile);

  return newTiles;
};

// TODO can produce boards which require guesses
// NOTE if we aren't passed a rand, just use an arbitrary rand
// might want to disable that
export const genBoard = (
  width: number,
  height: number,
  mineCount: number,
  freeTiles: Array<number>,
  rand: Rand = new Rand(Math.random())
): [Array<number>, Array<number>] => {
  const totalCells = width * height;
  const mines: Array<number> = [];

  while (mines.length < mineCount) {
    const location = Math.floor(rand.next() * totalCells);
    if (!freeTiles.includes(location) && !mines.includes(location))
      mines.push(location);
  }

  // Easier for me to reason about, not needed
  mines.sort((a, b) => a - b);

  // Calculate neighbors
  const neighbors = new Array(totalCells).fill(0);
  for (const mine of mines) {
    getNeighbors(mine, width, height).forEach((tile) => neighbors[tile]++);
  }
  return [mines, neighbors];
};
