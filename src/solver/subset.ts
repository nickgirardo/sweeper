import { CheckResult } from "./index.js";

import {
  areMutuallyExclusive,
  difference,
  isProperSubsetOf,
  setDifference,
  setIntersection,
  sumBy,
} from "../util/array.js";
import { range } from "../util/index.js";
import { Puzzle } from "../puzzle.js";

// TODO probably janky and should be rewritten
function* properSubsets(
  width: number,
  height: number,
  neighboringCells: Array<Set<number>>,
  boundryCells: Set<number>,
  checked: Set<number>
): Generator<[Array<number>, Array<number>]> {
  // All of the neighbors for a given cell which are unchecked
  // TODO Seems like a very expensive computation
  const uncheckedNeighboringCells = range(width * height).map((t) =>
    setDifference(neighboringCells[t], checked)
  );

  // Ascending order based on number of neighbors
  // NOTE Sorting here means we don't have to iterate over cells which have fewer neighbors than that
  // cell.  This might actually be slower than just iterating over all of the cells and exiting early
  const sortedBoundryCells = Array.from(boundryCells).sort(
    (a, b) =>
      uncheckedNeighboringCells[a].size - uncheckedNeighboringCells[b].size
  );

  for (const [ix, smaller] of sortedBoundryCells.entries()) {
    const otherCells = sortedBoundryCells.slice(ix + 1);

    for (const larger of otherCells) {
      if (
        isProperSubsetOf(
          uncheckedNeighboringCells[smaller],
          uncheckedNeighboringCells[larger]
        )
      )
        yield [[smaller], [larger]];
    }
  }

  for (const [ix, cell] of sortedBoundryCells.entries()) {
    const otherCells = sortedBoundryCells.slice(ix + 1);

    for (const other of otherCells) {
      if (
        !areMutuallyExclusive(
          uncheckedNeighboringCells[cell],
          uncheckedNeighboringCells[other]
        )
      )
        continue;

      // TODO might be a faster way to merge
      const union = new Set([
        ...uncheckedNeighboringCells[cell],
        ...uncheckedNeighboringCells[other],
      ]);

      for (const c of sortedBoundryCells) {
        if (c === cell || c === other) continue;

        if (isProperSubsetOf(union, uncheckedNeighboringCells[c]))
          yield [[cell, other], [c]];
      }
    }
  }
}

export const subsetSolver = (puzzle: Puzzle): CheckResult | false => {
  const {
    width,
    height,
    checked,
    flagged,
    neighbors,
    neighboringCells,
    boundryCells,
  } = puzzle;
  const uncheckedNeighboringCells = neighboringCells.map((t) =>
    setDifference(t, checked)
  );

  const unflaggedNeighboringMines = (t: number): number =>
    neighbors[t] - setIntersection(neighboringCells[t], flagged).size;

  for (const [smaller, larger] of properSubsets(
    width,
    height,
    neighboringCells,
    boundryCells,
    checked
  )) {
    // If the two sets have the same amount of mines that have not been flagged
    // Every cell which is in the larger but not the smaller is not a mine and can be
    // checked
    if (
      sumBy(smaller, unflaggedNeighboringMines) ===
      sumBy(larger, unflaggedNeighboringMines)
    ) {
      const safeToCheck = difference(
        larger.flatMap((t) => Array.from(uncheckedNeighboringCells[t])),
        smaller.flatMap((t) => Array.from(uncheckedNeighboringCells[t]))
      );

      return {
        safeToCheck: safeToCheck,
        safeToFlag: [],
      };
    }

    // If the difference between the number of unflagged mines is equal to the difference
    // between the number of neighboring cells, every cell neighboring the larger but not the smaller
    // is a mine and can be flagged
    const sizeDifference =
      sumBy(larger, (t) => uncheckedNeighboringCells[t].size) -
      sumBy(smaller, (t) => uncheckedNeighboringCells[t].size);

    const mineDifference =
      sumBy(larger, unflaggedNeighboringMines) -
      sumBy(smaller, unflaggedNeighboringMines);

    if (sizeDifference === mineDifference) {
      const safeToFlag = difference(
        larger.flatMap((t) => Array.from(uncheckedNeighboringCells[t])),
        smaller.flatMap((t) => Array.from(uncheckedNeighboringCells[t]))
      );

      return {
        safeToCheck: [],
        safeToFlag,
      };
    }
  }

  return false;
};
