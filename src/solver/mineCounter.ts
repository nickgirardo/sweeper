import { CheckResult } from "./index.js";
import { checkTiles, getNeighbors, range } from "../util/index.js";
import { difference, intersection, isSubsetOf, sumBy } from "../util/array.js";

// TODO better name lol
// TODO also return groups of size > 1
function* interestingGroup(
  width: number,
  height: number,
  checked: Array<number>,
  flagged: Array<number>
): Generator<Array<number>> {
  const hasUncheckedNeighbor = (t: number) =>
    !isSubsetOf(getNeighbors(t, width, height), checked);

  const boundryCells = difference(
    checked.filter(hasUncheckedNeighbor),
    flagged
  );

  for (const t of boundryCells) yield [t];
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

  // Naive check to see if using this solver makes any possible sense
  // If there are more mines remaining then we could possibly know about then we should give up
  const maxMinesWeBorder = sumBy(
    difference(checked, flagged),
    (t) =>
      neighbors[t] -
      intersection(getNeighbors(t, width, height), flagged).length
  );

  if (leftToFind > maxMinesWeBorder) return false;

  for (const cells of interestingGroup(width, height, checked, flagged)) {
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
