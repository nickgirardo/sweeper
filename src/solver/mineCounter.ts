import { CheckResult } from "./index.js";
import { checkTiles, getNeighbors, range } from "../util/index.js";
import {
  difference,
  intersection,
  isSubsetOf,
  sumBy,
  isUniq,
  subsequencesOfMaxLength,
} from "../util/array.js";

// Returns all subsequences of cells on the border
function* boundrySubsequences(
  width: number,
  height: number,
  checked: Array<number>,
  flagged: Array<number>
): Generator<Array<number>> {
  const maxSubsequenceSize = 4;

  const hasUncheckedNeighbor = (t: number) =>
    !isSubsetOf(getNeighbors(t, width, height), checked);

  const boundryCells = difference(
    checked.filter(hasUncheckedNeighbor),
    flagged
  );

  const cache: Array<Array<number>> = [];
  for (const t of boundryCells) {
    cache[t] = difference(getNeighbors(t, width, height), checked);
  }

  for (const cells of subsequencesOfMaxLength(
    boundryCells,
    maxSubsequenceSize
  )) {
    if (cells.length > maxSubsequenceSize) continue;

    const neighbors = cells.flatMap((t) => cache[t]);
    if (!isUniq(neighbors)) continue;

    yield cells;
  }
}

export const mineCounterSolver = (
  width: number,
  height: number,
  mineCount: number,
  neighbors: Array<number>,
  checked: Array<number>,
  flagged: Array<number>
): CheckResult | false => {
  const foundCount = flagged.length;
  const leftToFind = mineCount - foundCount;

  // Only attempt using this solver when 80% of the board has already been checked
  const requiredFillRatio = 0.8;

  if (width * height * requiredFillRatio > checked.length) return false;

  // Naive check to see if using this solver makes any possible sense
  // If there are more mines remaining then we could possibly know about then we should give up
  const maxMinesWeBorder = sumBy(
    difference(checked, flagged),
    (t) =>
      neighbors[t] -
      intersection(getNeighbors(t, width, height), flagged).length
  );

  if (leftToFind > maxMinesWeBorder) return false;

  for (const cells of boundrySubsequences(width, height, checked, flagged)) {
    const flaggedNeighboringMineCount = (t: number) =>
      intersection(getNeighbors(t, width, height), flagged).length;

    const neighboringMineCount = sumBy(
      cells,
      (t) => neighbors[t] - flaggedNeighboringMineCount(t)
    );

    if (neighboringMineCount === leftToFind) {
      const neighborsOfGroup = cells.flatMap((t) =>
        getNeighbors(t, width, height)
      );

      const safeToCheck = difference(
        difference(range(width * height), checked),
        neighborsOfGroup
      );

      if (!safeToCheck.length) continue;

      let newChecked = checked;
      for (const tile of safeToCheck) {
        newChecked = checkTiles(
          tile,
          width,
          height,
          newChecked,
          flagged,
          neighbors
        );
      }

      return {
        flagged,
        checked: newChecked,
      };
    }
  }

  return false;
};
