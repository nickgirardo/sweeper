import { Solution } from "./solver/index.js";
import { setDifference, setIntersection, setEvery } from "./util/array.js";
import { Rand, range } from "./util/index.js";

export interface PuzzleState {
  checked: Set<number>;
  flagged: Set<number>;
}

export class Puzzle {
  width: number;
  height: number;
  mineCount: number;
  neighbors: Array<number>;
  remainingNeighbors: Array<number>;
  mines: Set<number>;
  flagged: Set<number>;
  checked: Set<number>;

  neighboringCells: Array<Set<number>>;
  boundryCells: Set<number>;

  constructor(
    width: number,
    height: number,
    mineCount: number,
    startingTile: number,
    rand: Rand
  ) {
    const totalCells = width * height;

    this.width = width;
    this.height = height;
    this.mineCount = mineCount;
    this.mines = new Set();
    this.neighbors = new Array(totalCells).fill(0);
    this.flagged = new Set();
    this.checked = new Set();
    this.boundryCells = new Set();

    this.neighboringCells = range(width * height).map((t) =>
      this.#getNeighbors(t)
    );

    const freeTiles = [startingTile, ...this.neighboringCells[startingTile]];

    // Set mines
    while (this.mines.size < mineCount) {
      const location = Math.floor(rand.next() * totalCells);
      if (!freeTiles.includes(location) && !this.mines.has(location))
        this.mines.add(location);
    }

    // Calculate neighbors
    for (const mine of this.mines) {
      this.neighboringCells[mine].forEach((tile) => this.neighbors[tile]++);
    }

    this.remainingNeighbors = [...this.neighbors];

    this.checkTile(startingTile);
  }

  dumpState(): PuzzleState {
    return {
      checked: new Set(Array.from(this.checked)),
      flagged: new Set(Array.from(this.flagged)),
    };
  }

  updatePuzzle(safeToCheck: Array<number>, safeToFlag: Array<number>): void {
    for (const t of safeToCheck) this.#checkTileNoUpdate(t);
    for (const t of safeToFlag) this.#flagTileNoUpdate(t);

    this.#updateBoundryCacheFull();
  }

  // TODO update boundry cache after running
  // Might be easiest to just doing a full update in most cases :-(
  checkTile(tile: number): void {
    this.#checkTileNoUpdate(tile);
    this.#updateBoundryCacheFull();
  }

  #checkTileNoUpdate(tile: number): void {
    const go = (tile: number): void => {
      if (this.checked.has(tile)) return;

      this.checked.add(tile);

      // If there are no neighboring mines automatically check neighboring mines
      if (this.neighbors[tile] === 0)
        for (const n of this.neighboringCells[tile]) go(n);
    };

    if (this.flagged.has(tile)) return;

    if (this.checked.has(tile)) {
      const flaggedNeighbors = setIntersection(
        this.neighboringCells[tile],
        this.flagged
      );

      if (this.neighbors[tile] === flaggedNeighbors.size) {
        const unflaggedNeighbors = setDifference(
          this.neighboringCells[tile],
          this.flagged
        );
        unflaggedNeighbors.forEach(go);
      }
    }

    go(tile);
  }

  // NOTE this fn actually toggles the flagged state of a given tile
  flagTile(tile: number): void {
    this.#flagTileNoUpdate(tile);
    this.#updateBoundryCacheFull();
  }

  #flagTileNoUpdate(tile: number): void {
    if (this.flagged.has(tile)) {
      // Remove the tile from the flagged and checked lists
      this.flagged.delete(tile);
      this.checked.delete(tile);
      this.neighboringCells[tile].forEach((t) => this.remainingNeighbors[t]++);
    } else {
      // Add the tile to flagged and checked lists
      this.checked.add(tile);
      this.flagged.add(tile);
      this.neighboringCells[tile].forEach((t) => this.remainingNeighbors[t]--);
    }
  }

  checkSolution(solution: Solution): boolean {
    return (
      solution.puzzle.flagged.size === this.mines.size &&
      setDifference(solution.puzzle.flagged, this.mines).size === 0
    );
  }

  #updateBoundryCacheFull(): void {
    this.boundryCells = new Set();

    for (const t of setDifference(this.checked, this.flagged)) {
      if (!setEvery(this.neighboringCells[t], (c) => this.checked.has(c)))
        this.boundryCells.add(t);
    }
  }

  // Get ids of all neighboring tiles to a given tile
  // The list of neighbors is sorted in numerically ascending order
  #getNeighbors(tile: number): Set<number> {
    const { width, height } = this;
    const x = tile % width;
    const y = (tile - x) / width;

    return new Set(
      [
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
      ].filter((n): n is number => n !== false)
    );
  }
}
