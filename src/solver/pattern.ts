import { CheckResult } from "./index.js";

import { intersection, union } from "../util/array.js";
import { Puzzle } from "../puzzle.js";

// TODO explain why
// TODO explain why not higher patterns like 13231
export const patternSolver = (puzzle: Puzzle): CheckResult | false => {
  const {
    width,
    height,
    checked,
    neighboringCells,
    boundryCells,
    remainingNeighbors,
  } = puzzle;

  const uncheckedNeighboringCells = (t: number) =>
    Array.from(neighboringCells[t]).filter((t) => checked.isUnset(t));

  // 1-2-1 Patterns
  const checkHorizontal121 = (t: number): boolean =>
    remainingNeighbors[t] === 1 &&
    t % width < width - 2 &&
    boundryCells.has(t + 1) &&
    remainingNeighbors[t + 1] === 2 &&
    boundryCells.has(t + 2) &&
    remainingNeighbors[t + 2] === 1;

  const checkVertical121 = (t: number): boolean =>
    remainingNeighbors[t] === 1 &&
    t < width * (height - 2) &&
    boundryCells.has(t + width) &&
    remainingNeighbors[t + width] === 2 &&
    boundryCells.has(t + 2 * width) &&
    remainingNeighbors[t + 2 * width] === 1;

  // 1-2-2-1 Patterns
  const checkHorizontal1221 = (t: number): boolean =>
    remainingNeighbors[t] === 1 &&
    t % width < width - 3 &&
    boundryCells.has(t + 1) &&
    remainingNeighbors[t + 1] === 2 &&
    boundryCells.has(t + 2) &&
    remainingNeighbors[t + 2] === 2 &&
    boundryCells.has(t + 3) &&
    remainingNeighbors[t + 3] === 1;

  const checkVertical1221 = (t: number): boolean =>
    remainingNeighbors[t] === 1 &&
    t < width * (height - 3) &&
    boundryCells.has(t + width) &&
    remainingNeighbors[t + width] === 2 &&
    boundryCells.has(t + 2 * width) &&
    remainingNeighbors[t + 2 * width] === 2 &&
    boundryCells.has(t + 3 * width) &&
    remainingNeighbors[t + 3 * width] === 1;

  // Look for patterns
  for (const t of boundryCells) {
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
        union(
          Array.from(uncheckedNeighboringCells(t)),
          Array.from(uncheckedNeighboringCells(t + 2))
        )
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
        union(
          Array.from(uncheckedNeighboringCells(t)),
          Array.from(uncheckedNeighboringCells(t + 2 * width))
        )
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
        Array.from(uncheckedNeighboringCells(t)).concat(
          Array.from(uncheckedNeighboringCells(t + 3))
        )
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
        Array.from(uncheckedNeighboringCells(t)).concat(
          Array.from(uncheckedNeighboringCells(t + 3 * width))
        )
      );
    }

    if (safeToCheck.length)
      return {
        safeToCheck,
        safeToFlag: [],
      };
  }

  return false;
};
