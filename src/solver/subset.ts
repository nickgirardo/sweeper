import { SolutionStep, Solver } from "./index.js";

import { difference, intersection } from "../util/array.js";
import {
  checkTiles,
  range,
  getNeighbors as uGetNeighbors,
} from "../util/index.js";

function* properSubsets(
  width: number,
  height: number,
  checked: Array<number>,
  flagged: Array<number>
): Generator<[number, number]> {
  // All of the neighbors for a given cell which are unchecked
  const neighborCache = range(width * height).map((t) =>
    difference(uGetNeighbors(t, width, height), checked)
  );

  const hasUncheckedNeighbor = (t: number) => neighborCache[t].length > 0;

  const boundryCells = difference(
    checked.filter(hasUncheckedNeighbor),
    flagged
  );

  // Ascending order based on number of neighbors
  // NOTE Sorting here means we don't have to iterate over cells which have fewer neighbors than that
  // cell.  This might actually be slower than just iterating over all of the cells and exiting early
  const sortedBoundryCells = boundryCells.sort(
    (a, b) => neighborCache[a].length - neighborCache[b].length
  );

  for (const [ix, smaller] of sortedBoundryCells.entries()) {
    const cellsWithAtLeastAsManyNeighbors = sortedBoundryCells.slice(ix + 1);

    for (const larger of cellsWithAtLeastAsManyNeighbors) {
      // smaller and larger may be equal in size, in which case smaller can not be a proper subset
      // of larger
      // Note that this check is technically unnecessary as the bellow check should also eliminate
      // every pairing which this eliminates as smaller != larger so if they are the same size they
      // must have at least one different cell.  However this should be much faster to evaluate
      if (neighborCache[smaller].length === neighborCache[larger].length)
        continue;

      // If smaller includes some cell which is not in larger they are not proper subsets
      if (
        !neighborCache[smaller].every((n) => neighborCache[larger].includes(n))
      )
        continue;

      // From here we can be sure that smaller is a proper subset of larger!
      yield [smaller, larger];
    }
  }
}

export const subsetSolver = (
  width: number,
  height: number,
  neighbors: Array<number>,
  checked: Array<number>,
  flagged: Array<number>
): SolutionStep | false => {
  const start = performance.now();

  // All of the neighbors for a given cell
  const neighborCache = range(width * height).map((t) =>
    uGetNeighbors(t, width, height)
  );

  const uncheckedNeighborCache = neighborCache.map((t) =>
    difference(t, checked)
  );

  const unflaggedNeighboringMines = (t: number) =>
    neighbors[t] - intersection(neighborCache[t], flagged).length;

  for (const [smaller, larger] of properSubsets(
    width,
    height,
    checked,
    flagged
  )) {
    // If the two sets have the same amount of mines that have not been flagged
    // Every cell which is in the larger but not the smaller is not a mine and can be
    // checked
    if (
      unflaggedNeighboringMines(smaller) === unflaggedNeighboringMines(larger)
    ) {
      const safeToCheck = difference(
        uncheckedNeighborCache[larger],
        uncheckedNeighborCache[smaller]
      );

      let newChecked = checked;
      for (const tile of safeToCheck) {
        newChecked = checkTiles(
          tile,
          width,
          height,
          checked,
          flagged,
          neighbors
        );
      }

      return {
        flagged,
        checked: newChecked,
        solver: Solver.Subset,
        stepTime: performance.now() - start,
      };
    }

    // If the difference between the number of unflagged mines is equal to the difference
    // between the number of neighboring cells, every cell neighboring the larger but not the smaller
    // is a mine and can be flagged
    const sizeDifference =
      uncheckedNeighborCache[larger].length -
      uncheckedNeighborCache[smaller].length;

    const mineDifference =
      unflaggedNeighboringMines(larger) - unflaggedNeighboringMines(smaller);

    if (sizeDifference === mineDifference) {
      const safeToFlag = difference(
        uncheckedNeighborCache[larger],
        uncheckedNeighborCache[smaller]
      );

      return {
        flagged: flagged.concat(safeToFlag),
        checked: checked.concat(safeToFlag),
        solver: Solver.Subset,
        stepTime: performance.now() - start,
      };
    }
  }

  return false;
};
