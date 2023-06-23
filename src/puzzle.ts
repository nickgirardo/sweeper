import { Rand, checkTiles, getNeighbors } from "./util/index.js";

export type Puzzle = {
  width: number;
  height: number;
  mineCount: number;
  mines: Array<number>;
  neighbors: Array<number>;
  flagged: Array<number>;
  checked: Array<number>;
};

export const genBoard = (
  width: number,
  height: number,
  mineCount: number,
  startingTile: number,
  rand: Rand
): Puzzle => {
  const freeTiles = [
    startingTile,
    ...getNeighbors(startingTile, width, height),
  ];

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

  const puzzle = {
    width,
    height,
    mineCount,
    mines,
    neighbors,
    flagged: [],
    checked: [],
  };

  return {
    ...puzzle,
    checked: checkTiles(startingTile, puzzle),
  };
};
