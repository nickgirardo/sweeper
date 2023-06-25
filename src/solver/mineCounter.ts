import { CheckResult } from "./index.js";
import { range } from "../util/index.js";
import {
  difference,
  sumBy,
  isUniq,
  setDifference,
  subsetsOfMaxLength,
  setIntersection,
} from "../util/array.js";
import { Puzzle } from "../puzzle.js";

// Returns all subsequences of cells on the border
function* boundrySubsequences(
  checked: Set<number>,
  neighboringCells: Array<Set<number>>,
  boundryCells: Set<number>
): Generator<Array<number>> {
  const maxSubsequenceSize = 4;

  const cache: Array<Set<number>> = [];
  for (const t of boundryCells) {
    cache[t] = setDifference(neighboringCells[t], checked);
  }

  for (const cells of subsetsOfMaxLength(boundryCells, maxSubsequenceSize)) {
    if (cells.length > maxSubsequenceSize) continue;

    const neighbors = cells.flatMap((t) => Array.from(cache[t]));
    if (!isUniq(neighbors)) continue;

    yield cells;
  }
}

export const mineCounterSolver = (puzzle: Puzzle): CheckResult | false => {
  const {
    width,
    height,
    flagged,
    checked,
    mineCount,
    neighbors,
    neighboringCells,
    boundryCells,
  } = puzzle;
  const foundCount = flagged.size;
  const leftToFind = mineCount - foundCount;

  // Only attempt using this solver when 80% of the board has already been checked
  const requiredFillRatio = 0.8;

  if (width * height * requiredFillRatio > checked.size) return false;

  // Naive check to see if using this solver makes any possible sense
  // If there are more mines remaining then we could possibly know about then we should give up
  const maxMinesWeBorder = sumBy(
    Array.from(setDifference(checked, flagged)),
    (t) => neighbors[t] - setIntersection(neighboringCells[t], flagged).size
  );

  if (leftToFind > maxMinesWeBorder) return false;

  for (const cells of boundrySubsequences(
    checked,
    neighboringCells,
    boundryCells
  )) {
    // TODO cache this on puzzle probably
    const flaggedNeighboringMineCount = (t: number) =>
      setIntersection(neighboringCells[t], flagged).size;

    const neighboringMineCount = sumBy(
      cells,
      (t) => neighbors[t] - flaggedNeighboringMineCount(t)
    );

    if (neighboringMineCount === leftToFind) {
      const neighborsOfGroup = cells.flatMap((t) =>
        Array.from(neighboringCells[t])
      );

      const safeToCheck = difference(
        difference(range(width * height), Array.from(checked)),
        neighborsOfGroup
      );

      if (!safeToCheck.length) continue;

      return {
        safeToCheck,
        safeToFlag: [],
      };
    }
  }

  return false;
};
