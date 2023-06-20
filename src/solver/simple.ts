import { SolutionStep, Solver } from "./index.js";
import { checkTiles, getNeighbors } from "../util/index.js";
import { difference, intersection, isSubsetOf } from "../util/array.js";

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
export const simpleSolver = (
  width: number,
  height: number,
  neighbors: Array<number>,
  checked: Array<number>,
  flagged: Array<number>
): SolutionStep | false => {
  const start = performance.now();

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

  const satiatedCell = boundryCells.find(isSatiated);

  if (satiatedCell) {
    const newChecked = checkTiles(
      satiatedCell,
      width,
      height,
      checked,
      flagged,
      neighbors
    );

    return {
      solver: Solver.Simple,
      stepTime: performance.now() - start,
      checked: newChecked,
      flagged,
    };
  }

  // isAntiSatiated: does the tile require that all of its unchecked neighbors are mines?
  const isAntiSatiated = (t: number) =>
    difference(getNeighbors(t, width, height), checked).length ===
    neighbors[t] - intersection(getNeighbors(t, width, height), flagged).length;

  const antiSatiatedCell = boundryCells.find(isAntiSatiated);

  if (antiSatiatedCell) {
    const uncheckedNeighbors = difference(
      getNeighbors(antiSatiatedCell, width, height),
      checked
    );

    return {
      solver: Solver.Simple,
      checked: checked.concat(uncheckedNeighbors),
      flagged: flagged.concat(uncheckedNeighbors),
      stepTime: performance.now() - start,
    };
  }

  return false;
};
