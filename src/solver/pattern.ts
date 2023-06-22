import { CheckResult } from "./index.js";

import { difference, intersection, union } from "../util/array.js";
import {
  checkTiles,
  range,
  getNeighbors as uGetNeighbors,
} from "../util/index.js";

// TODO explain why
// TODO explain why not higher patterns like 13231
export const patternSolver = (
  width: number,
  height: number,
  neighbors: Array<number>,
  checked: Array<number>,
  flagged: Array<number>
): CheckResult | false => {
  // All of the neighbors for a given cell
  const neighborCache = range(width * height).map((t) =>
    uGetNeighbors(t, width, height)
  );

  const uncheckedNeighborCache = neighborCache.map((t) =>
    difference(t, checked)
  );

  const neighboringMineCount = (t: number): number =>
    neighbors[t] - intersection(neighborCache[t], flagged).length;

  const hasUncheckedNeighbor = (t: number) =>
    uncheckedNeighborCache[t].length > 0;

  const boundryCells = difference(
    checked.filter(hasUncheckedNeighbor),
    flagged
  );

  const checkHorizontal121 = (t: number): boolean =>
    neighboringMineCount(t) === 1 &&
    neighborCache[t].includes(t + 1) &&
    boundryCells.includes(t + 1) &&
    neighboringMineCount(t + 1) === 2 &&
    neighborCache[t + 1].includes(t + 2) &&
    boundryCells.includes(t + 2) &&
    neighboringMineCount(t + 2) === 1;

  const checkVertical121 = (t: number): boolean =>
    neighboringMineCount(t) === 1 &&
    neighborCache[t].includes(t + width) &&
    boundryCells.includes(t + width) &&
    neighboringMineCount(t + width) === 2 &&
    neighborCache[t + width].includes(t + 2 * width) &&
    boundryCells.includes(t + 2 * width) &&
    neighboringMineCount(t + 2 * width) === 1;

  // Look for patterns
  for (const t of boundryCells) {
    // Look for horizontal 1-2-1 pattern
    if (checkHorizontal121(t)) {
      const safeToCheck = intersection(
        [
          t - width - 1,
          t - width + 1,
          t - width + 3,
          t - 1,
          t + 3,
          t + width - 1,
          t + width + 1,
          t + width + 3,
        ],
        union(uncheckedNeighborCache[t], uncheckedNeighborCache[t + 2])
      );

      if (safeToCheck.length) {
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

    // Look for vertical 1-2-1 pattern
    if (checkVertical121(t)) {
      const safeToCheck = intersection(
        [
          t - width - 1,
          t - width,
          t - width + 1,
          t + width - 1,
          t + width + 1,
          t + 3 * width - 1,
          t + 3 * width,
          t + 3 * width + 1,
        ],
        union(uncheckedNeighborCache[t], uncheckedNeighborCache[t + 2 * width])
      );

      if (safeToCheck.length) {
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
  }

  return false;
};
