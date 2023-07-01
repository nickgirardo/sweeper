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

  const satiatedCells = Array.from(boundryCells).filter(isSatiated);

  if (satiatedCells.length)
    return {
      safeToCheck: satiatedCells,
      safeToFlag: [],
    };

  // isAntiSatiated: does the tile require that all of its unchecked neighbors are mines?
  const isAntiSatiated = (t: number) =>
    Array.from(neighboringCells[t]).filter((t) => !checked[t]).length ===
    remainingNeighbors[t];

  const antiSatiatedCells = Array.from(boundryCells).filter(isAntiSatiated);

  if (antiSatiatedCells.length) {
    const allNeighbors = new Set<number>();
    for (const t of antiSatiatedCells) {
      neighboringCells[t].forEach((b) => allNeighbors.add(b));
    }

    // TODO might want to return sets instead of arrays
    return {
      safeToCheck: [],
      safeToFlag: Array.from(allNeighbors).filter((t) => !checked[t]),
    };
  }

  return false;
};
