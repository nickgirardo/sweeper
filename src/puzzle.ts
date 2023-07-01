import { Solution } from "./solver/index.js";
import { setEvery } from "./util/array.js";
import { Bitset } from "./util/bitset.js";
import { Rand, range } from "./util/index.js";

export interface PuzzleState {
  checked: Bitset;
  flagged: Bitset;
}

export class Puzzle {
  readonly width: number;
  readonly height: number;
  readonly mineCount: number;
  readonly neighbors: Array<number>;
  readonly remainingNeighbors: Array<number>;
  readonly mines: Set<number>;
  readonly flagged: Bitset;
  readonly checked: Bitset;
  readonly checkedButNotFlagged: Bitset;

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
    this.boundryCells = new Set();

    this.flagged = new Bitset(totalCells);
    this.checked = new Bitset(totalCells);
    this.checkedButNotFlagged = new Bitset(totalCells);

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
      checked: Bitset.fromBitArray([...this.checked]),
      flagged: Bitset.fromBitArray([...this.flagged]),
    };
  }

  updatePuzzle(safeToCheck: Array<number>, safeToFlag: Array<number>): void {
    const beforeSize = this.checked.setCount;
    for (const t of safeToCheck) this.#checkTileNoUpdate(t);
    for (const t of safeToFlag) this.#flagTileNoUpdate(t);
    const newlyChecked = this.checked.setCount - beforeSize;

    if (newlyChecked === safeToCheck.length + safeToFlag.length) {
      safeToFlag.forEach((t) => this.#updateBoundryCachePartial(t));
      safeToCheck.forEach((t) => this.#updateBoundryCachePartial(t));
    } else {
      this.#updateBoundryCacheFull();
    }
  }

  // TODO update boundry cache after running
  // Might be easiest to just doing a full update in most cases :-(
  checkTile(tile: number): void {
    this.#checkTileNoUpdate(tile);
    this.#updateBoundryCacheFull();
  }

  #checkTileNoUpdate(tile: number): void {
    const go = (tile: number): void => {
      if (this.checked.isSet(tile)) return;

      this.checked.set(tile);
      this.checkedButNotFlagged.set(tile);

      // If there are no neighboring mines automatically check neighboring mines
      if (this.neighbors[tile] === 0)
        for (const n of this.neighboringCells[tile]) go(n);
    };

    if (this.flagged.isSet(tile)) return;

    if (this.checked.isSet(tile)) {
      const flaggedNeighbors = Array.from(this.neighboringCells[tile]).filter(
        (t) => this.flagged.isSet(t)
      );

      if (this.neighbors[tile] === flaggedNeighbors.length) {
        const unflaggedNeighbors = Array.from(
          this.neighboringCells[tile]
        ).filter((t) => this.flagged.isUnset(t));

        unflaggedNeighbors.forEach(go);
      }
    }

    go(tile);
  }

  // NOTE this fn actually toggles the flagged state of a given tile
  flagTile(tile: number): void {
    this.#flagTileNoUpdate(tile);
    this.#updateBoundryCachePartial(tile);
  }

  #flagTileNoUpdate(tile: number): void {
    if (this.flagged.isSet(tile)) {
      // Remove the tile from the flagged and checked lists
      this.flagged.unset(tile);
      this.checked.unset(tile);
      this.neighboringCells[tile].forEach((t) => this.remainingNeighbors[t]++);
    } else {
      // Add the tile to flagged and checked lists
      this.flagged.set(tile);
      this.checked.set(tile);
      this.neighboringCells[tile].forEach((t) => this.remainingNeighbors[t]--);
    }
  }

  checkSolution = (solution: Solution): boolean =>
    solution.puzzle.flagged.setCount === this.mines.size &&
    Array.from(this.mines).filter((m) => solution.puzzle.flagged.isUnset(m))
      .length === 0;

  #updateBoundryCacheFull(): void {
    this.boundryCells = new Set();

    const checkedButNotFlagged = this.checkedButNotFlagged.getSetIndicies();

    for (const t of checkedButNotFlagged) {
      if (!setEvery(this.neighboringCells[t], (c) => this.checked.isSet(c)))
        this.boundryCells.add(t);
    }
  }

  // NOTE tile is the cell which has changed
  // the cells which might be changed are itself and the checked, unflagged neighbors
  #updateBoundryCachePartial(tile: number): void {
    const tilesToUpdate = Array.from(this.neighboringCells[tile]).filter((t) =>
      this.checkedButNotFlagged.isSet(t)
    );

    const update = (t: number): void => {
      if (!setEvery(this.neighboringCells[t], (c) => this.checked.isSet(c))) {
        this.boundryCells.add(t);
      } else {
        this.boundryCells.delete(t);
      }
    };

    // TODO without the checks here I solve more puzzles. Look into why that is
    if (this.checkedButNotFlagged.isSet(tile)) update(tile);

    for (const t of tilesToUpdate) update(t);
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
