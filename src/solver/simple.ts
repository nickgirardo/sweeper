import { CheckResult } from "./index.js";
import { getNeighbors } from "../util/index.js";
import { difference, intersection, isSubsetOf, uniq } from "../util/array.js";
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
// NOTE Perf: we call `getNeighbors` a lot in this function, it would probably make sense to cache
// the results up front for all cells.  This fn takes such a small amount of time relative to the
// execution of the entire solver I'm not going to bother right now
//
// TODO Leave a note regarding why it makes sense to return after isSatiated
export const simpleSolver = (puzzle: Puzzle): CheckResult | false => {
  const { width, height, checked, flagged, neighbors } = puzzle;

  const hasUncheckedNeighbor = (t: number) =>
    !isSubsetOf(getNeighbors(t, width, height), checked);

  const boundryCells = difference(
    checked.filter(hasUncheckedNeighbor),
    flagged
  );

  // isSatiated: are all of the tiles neighboring mines flagged already?
  const isSatiated = (t: number) =>
    neighbors[t] ===
    intersection(getNeighbors(t, width, height), flagged).length;

  const satiatedCells = boundryCells.filter(isSatiated);

  if (satiatedCells.length)
    return {
      safeToCheck: satiatedCells,
      safeToFlag: [],
    };

  // isAntiSatiated: does the tile require that all of its unchecked neighbors are mines?
  const isAntiSatiated = (t: number) =>
    difference(getNeighbors(t, width, height), checked).length ===
    neighbors[t] - intersection(getNeighbors(t, width, height), flagged).length;

  const antiSatiatedCells = boundryCells.filter(isAntiSatiated);

  if (antiSatiatedCells.length) {
    const allNeighbors = uniq(
      antiSatiatedCells.reduce(
        (acc: Array<number>, b) => acc.concat(getNeighbors(b, width, height)),
        []
      )
    );

    return {
      safeToCheck: [],
      safeToFlag: difference(allNeighbors, checked),
    };
  }

  return false;
};
