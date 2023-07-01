import { CheckResult } from "./index.js";
import {
  difference,
  sumBy,
  isUniq,
  subsetsOfMaxLength,
  getSetIndicies,
  getUnsetIndicies,
  intersection,
} from "../util/array.js";
import { Puzzle } from "../puzzle.js";

// Returns all subsequences of cells on the border
function* boundrySubsequences(
  checked: Array<number>,
  neighboringCells: Array<Set<number>>,
  boundryCells: Set<number>
): Generator<Array<number>> {
  const maxSubsequenceSize = 4;

  const cache: Array<Array<number>> = [];
  for (const t of boundryCells) {
    cache[t] = difference(Array.from(neighboringCells[t]), checked);
  }

  for (const cells of subsetsOfMaxLength(boundryCells, maxSubsequenceSize)) {
    if (cells.length > maxSubsequenceSize) continue;

    // NOTE joining the sets in this way is very slow
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
    flaggedCount,
    checked,
    checkedCount,
    checkedButNotFlagged,
    mineCount,
    neighbors,
    neighboringCells,
    boundryCells,
    remainingNeighbors,
  } = puzzle;

  const leftToFind = mineCount - flaggedCount;

  // Only attempt using this solver when 80% of the board has already been checked
  const requiredFillRatio = 0.8;

  if (width * height * requiredFillRatio > checkedCount) return false;

  const openCellCount = width * height - checkedCount;
  // All cells should be flagged
  if (openCellCount === leftToFind)
    return {
      safeToCheck: [],
      safeToFlag: checked.map((t, ix) => (t ? -1 : ix)).filter((t) => t !== -1),
    };

  // Naive check to see if using this solver makes any possible sense
  // If there are more mines remaining then we could possibly know about then we should give up
  const maxMinesWeBorder = sumBy(
    getSetIndicies(checkedButNotFlagged),
    (t) => remainingNeighbors[t]
  );

  if (leftToFind > maxMinesWeBorder) return false;

  for (const cells of boundrySubsequences(
    getSetIndicies(checked),
    neighboringCells,
    boundryCells
  )) {
    const neighboringMineCount = sumBy(cells, (t) => remainingNeighbors[t]);

    if (neighboringMineCount === leftToFind) {
      const neighborsOfGroup = cells.flatMap((t) =>
        Array.from(neighboringCells[t])
      );

      const safeToCheck = difference(
        getUnsetIndicies(checked),
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
