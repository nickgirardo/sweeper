import { CheckResult } from "./index.js";
import { Puzzle } from "../puzzle.js";

// A fast, simple solver which can only progress the puzzle in somewhat trivial positions
//
// This attempts to find a tile which satisfies one of two cases
// - All of the tiles neighboring mines have already been flagged (tile is satiated)
// - All unchecked tiles neighboring the tile must have mines (tile is anti-satiated)
//
// This solver is not able to complete most boards on its own and is intended as a complement
// to the more thorough but significantly slower satSolver
//
// TODO Leave a note regarding why it makes sense to return after isSatiated
export const simpleSolver = (puzzle: Puzzle): CheckResult | false => {
  const { checked, neighboringCells, boundryCells, remainingNeighbors } =
    puzzle;

  // isSatiated: are all of the tiles neighboring mines flagged already?
  const isSatiated = (t: number) => remainingNeighbors[t] === 0;

  const satiatedCells = boundryCells.filter(isSatiated);

  if (satiatedCells.length)
    return {
      safeToCheck: satiatedCells,
      safeToFlag: [],
    };

  // isAntiSatiated: does the tile require that all of its unchecked neighbors are mines?
  const isAntiSatiated = (t: number) =>
    neighboringCells[t].filter((t) => checked.isUnset(t)).length ===
    remainingNeighbors[t];

  const antiSatiatedCells = boundryCells.filter(isAntiSatiated);

  if (antiSatiatedCells.length) {
    const allNeighbors = new Array<number>();
    for (const t of antiSatiatedCells) {
      for (const b of neighboringCells[t]) {
        if (!allNeighbors.includes(b)) allNeighbors.push(b);
      }
    }

    // TODO might want to return sets instead of arrays
    return {
      safeToCheck: [],
      safeToFlag: allNeighbors.filter((t) => checked.isUnset(t)),
    };
  }

  return false;
};
