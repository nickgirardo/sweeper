import { CheckResult } from "./index.js";
import {
  difference,
  sumBy,
  isUniq,
  subsequencesOfMaxLength,
} from "../util/array.js";
import { Puzzle } from "../puzzle.js";

// Returns all subsequences of cells on the border
function* boundrySubsequences(
  checked: Array<number>,
  neighboringCells: Array<Array<number>>,
  boundryCells: Array<number>
): Generator<Array<number>> {
  const maxSubsequenceSize = 4;

  const cache: Array<Array<number>> = [];
  for (const t of boundryCells) {
    cache[t] = difference(neighboringCells[t], checked);
  }

  for (const cells of subsequencesOfMaxLength(
    boundryCells,
    maxSubsequenceSize
  )) {
    if (cells.length > maxSubsequenceSize) continue;

    // NOTE joining the sets in this way is very slow
    const neighbors = cells.flatMap((t) => cache[t]);
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
    checkedButNotFlagged,
    mineCount,
    neighboringCells,
    boundryCells,
    remainingNeighbors,
  } = puzzle;

  const leftToFind = mineCount - flagged.setCount;

  // Only attempt using this solver when 80% of the board has already been checked
  const requiredFillRatio = 0.8;

  if (width * height * requiredFillRatio > checked.setCount) return false;

  const openCellCount = width * height - checked.setCount;
  // All cells should be flagged
  if (openCellCount === leftToFind)
    return {
      safeToCheck: [],
      safeToFlag: checked.getUnsetIndicies(),
    };

  // Naive check to see if using this solver makes any possible sense
  // If there are more mines remaining then we could possibly know about then we should give up
  const maxMinesWeBorder = sumBy(
    checkedButNotFlagged.getSetIndicies(),
    (t) => remainingNeighbors[t]
  );

  if (leftToFind > maxMinesWeBorder) return false;

  for (const cells of boundrySubsequences(
    checked.getSetIndicies(),
    neighboringCells,
    boundryCells
  )) {
    const neighboringMineCount = sumBy(cells, (t) => remainingNeighbors[t]);

    if (neighboringMineCount === leftToFind) {
      const neighborsOfGroup = cells.flatMap((t) => neighboringCells[t]);

      const safeToCheck = difference(
        checked.getUnsetIndicies(),
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
