import { CheckResult } from "./index.js";

import {
  areMutuallyExclusive,
  difference,
  intersection,
  isProperSubsetOf,
  sumBy,
} from "../util/array.js";
import { range, getNeighbors as uGetNeighbors } from "../util/index.js";
import { Puzzle } from "../puzzle.js";

// TODO probably janky and should be rewritten
function* properSubsets(
  width: number,
  height: number,
  checked: Array<number>,
  flagged: Array<number>
): Generator<[Array<number>, Array<number>]> {
  // All of the neighbors for a given cell which are unchecked
  const neighborCache = range(width * height).map((t) =>
    difference(uGetNeighbors(t, width, height), checked)
  );

  const hasUncheckedNeighbor = (t: number) => neighborCache[t].length > 0;

  const boundryCells = difference(
    checked.filter(hasUncheckedNeighbor),
    flagged
  );

  // Ascending order based on number of neighbors
  // NOTE Sorting here means we don't have to iterate over cells which have fewer neighbors than that
  // cell.  This might actually be slower than just iterating over all of the cells and exiting early
  const sortedBoundryCells = boundryCells.sort(
    (a, b) => neighborCache[a].length - neighborCache[b].length
  );

  for (const [ix, smaller] of sortedBoundryCells.entries()) {
    const otherCells = sortedBoundryCells.slice(ix + 1);

    for (const larger of otherCells) {
      if (isProperSubsetOf(neighborCache[smaller], neighborCache[larger]))
        yield [[smaller], [larger]];
    }
  }

  for (const [ix, cell] of sortedBoundryCells.entries()) {
    const otherCells = sortedBoundryCells.slice(ix + 1);

    for (const other of otherCells) {
      if (!areMutuallyExclusive(neighborCache[cell], neighborCache[other]))
        continue;

      const union = neighborCache[cell].concat(neighborCache[other]);

      for (const c of sortedBoundryCells) {
        if (c === cell || c === other) continue;

        if (isProperSubsetOf(union, neighborCache[c]))
          yield [[cell, other], [c]];
      }
    }
  }
}

export const subsetSolver = (puzzle: Puzzle): CheckResult | false => {
  const { width, height, checked, flagged, neighbors } = puzzle;
  // All of the neighbors for a given cell
  const neighborCache = range(width * height).map((t) =>
    uGetNeighbors(t, width, height)
  );

  const uncheckedNeighborCache = neighborCache.map((t) =>
    difference(t, checked)
  );

  const unflaggedNeighboringMines = (t: number): number =>
    neighbors[t] - intersection(neighborCache[t], flagged).length;

  for (const [smaller, larger] of properSubsets(
    width,
    height,
    checked,
    flagged
  )) {
    // If the two sets have the same amount of mines that have not been flagged
    // Every cell which is in the larger but not the smaller is not a mine and can be
    // checked
    if (
      sumBy(smaller, unflaggedNeighboringMines) ===
      sumBy(larger, unflaggedNeighboringMines)
    ) {
      const safeToCheck = difference(
        larger.flatMap((t) => uncheckedNeighborCache[t]),
        smaller.flatMap((t) => uncheckedNeighborCache[t])
      );

      return {
        safeToCheck,
        safeToFlag: [],
      };
    }

    // If the difference between the number of unflagged mines is equal to the difference
    // between the number of neighboring cells, every cell neighboring the larger but not the smaller
    // is a mine and can be flagged
    const sizeDifference =
      sumBy(larger, (t) => uncheckedNeighborCache[t].length) -
      sumBy(smaller, (t) => uncheckedNeighborCache[t].length);

    const mineDifference =
      sumBy(larger, unflaggedNeighboringMines) -
      sumBy(smaller, unflaggedNeighboringMines);

    if (sizeDifference === mineDifference) {
      const safeToFlag = difference(
        larger.flatMap((t) => uncheckedNeighborCache[t]),
        smaller.flatMap((t) => uncheckedNeighborCache[t])
      );

      return {
        safeToCheck: [],
        safeToFlag,
      };
    }
  }

  return false;
};
