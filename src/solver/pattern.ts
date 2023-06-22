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

  // 1-2-1 Patterns
  const checkHorizontal121 = (t: number): boolean =>
    neighboringMineCount(t) === 1 &&
    t % width < width - 2 &&
    boundryCells.includes(t + 1) &&
    neighboringMineCount(t + 1) === 2 &&
    boundryCells.includes(t + 2) &&
    neighboringMineCount(t + 2) === 1;

  const checkVertical121 = (t: number): boolean =>
    neighboringMineCount(t) === 1 &&
    t < width * (height - 2) &&
    boundryCells.includes(t + width) &&
    neighboringMineCount(t + width) === 2 &&
    boundryCells.includes(t + 2 * width) &&
    neighboringMineCount(t + 2 * width) === 1;

  // 1-2-2-1 Patterns
  const checkHorizontal1221 = (t: number): boolean =>
    neighboringMineCount(t) === 1 &&
    t % width < width - 3 &&
    boundryCells.includes(t + 1) &&
    neighboringMineCount(t + 1) === 2 &&
    boundryCells.includes(t + 2) &&
    neighboringMineCount(t + 2) === 2 &&
    boundryCells.includes(t + 3) &&
    neighboringMineCount(t + 3) === 1;

  const checkVertical1221 = (t: number): boolean =>
    neighboringMineCount(t) === 1 &&
    t < width * (height - 3) &&
    boundryCells.includes(t + width) &&
    neighboringMineCount(t + width) === 2 &&
    boundryCells.includes(t + 2 * width) &&
    neighboringMineCount(t + 2 * width) === 2 &&
    boundryCells.includes(t + 3 * width) &&
    neighboringMineCount(t + 3 * width) === 1;

  // Look for patterns
  // NOTE Regarding the slice: the last two cells cannot possible be the start of a pattern
  // as patterns have a minimum length of 3
  for (const t of boundryCells.slice(0, -2)) {
    let safeToCheck: Array<number> = [];
    // Look for horizontal 1-2-1 pattern
    if (checkHorizontal121(t)) {
      safeToCheck = intersection(
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
    } else if (checkVertical121(t)) {
      // Look for vertical 1-2-1 pattern
      safeToCheck = intersection(
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
    } else if (checkHorizontal1221(t)) {
      safeToCheck = intersection(
        [
          t - width - 1,
          t - width,
          t - width + 3,
          t - width + 4,
          t - 1,
          t + 4,
          t - width - 1,
          t - width,
          t - width + 3,
          t - width + 4,
        ],
        // NOTE concat can be used here instead of union as the cells cannot have overlap
        // This just saves on calling uniq on the array
        uncheckedNeighborCache[t].concat(uncheckedNeighborCache[t + 3])
      );
    } else if (checkVertical1221(t)) {
      // Look for vertical 1-2-1 pattern
      safeToCheck = intersection(
        [
          t - width - 1,
          t - width,
          t - width + 1,
          t - 1,
          t + 1,
          t + 3 * width - 1,
          t + 3 * width + 1,
          t + 4 * width - 1,
          t + 4 * width,
          t + 4 * width + 1,
        ],
        uncheckedNeighborCache[t].concat(uncheckedNeighborCache[t + 3 * width])
      );
    }

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

  return false;
};
