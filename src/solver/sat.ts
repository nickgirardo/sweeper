import satSolve from "boolean-sat";

import { SolutionStep, Solver } from "./index.js";
import { range, checkTiles, getNeighbors } from "../util/index.js";
import { Clause, nOf } from "../util/solver.js";

const baseClauses = (
  width: number,
  height: number,
  mineCount: number,
  neighbors: Array<number>,
  checked: Array<number>,
  flagged: Array<number>
): Array<Clause> => {
  const totalCells = width * height;
  const maxNeighboringMines = 8;
  const valuesPerCell = maxNeighboringMines + 1 + 1;
  const vars = range(totalCells * valuesPerCell).map((v) => v + 1);
  const mines = vars
    .filter((v) => !Boolean((v + 1) % valuesPerCell))
    .map((v) => v + 1);

  let ret: Array<Clause> = [];

  // Each cell can only have one value
  for (const t of range(totalCells)) {
    ret = ret.concat(
      nOf(
        1,
        range(valuesPerCell).map((v) => v + t * valuesPerCell + 1)
      )
    );
  }

  // The number of total mines is known
  const mineClauses = nOf(mineCount, mines);
  ret = ret.concat(mineClauses);

  for (const t of checked) {
    // Checked cells have a known value
    if (flagged.includes(t)) continue;

    ret.push([t * valuesPerCell + neighbors[t] + 1]);

    // Checked cells have a known number of mine neighbors
    ret = ret.concat(
      nOf(
        neighbors[t],
        getNeighbors(t, width, height).map((t) => mines[t])
      )
    );
  }

  // Flagged mines have known values
  for (const mine of flagged) ret.push([mine * valuesPerCell + valuesPerCell]);

  return ret;
};

export const satSolver = (
  width: number,
  height: number,
  mineCount: number,
  neighbors: Array<number>,
  checked: Array<number>,
  flagged: Array<number>
): SolutionStep | false => {
  const cellFromVar = (satVar: number): number => Math.floor((satVar - 1) / 10);
  const mineFromVar = (satVar: number): number =>
    (cellFromVar(satVar) + 1) * 10;

  const stepStart = performance.now();

  const clauses = baseClauses(
    width,
    height,
    mineCount,
    neighbors,
    checked,
    flagged
  );
  const solution = satSolve(width * height * 10, clauses);

  if (!solution) {
    console.log("not able to find a solution");
    return false;
  }

  // TODO perf: might want to sort to have the cells on the periphery first
  const newDecisions = Object.entries(solution)
    .filter(([_, val]) => Boolean(val))
    .map(([key, _]) => Number(key))
    .filter((val) => !checked.includes(cellFromVar(val)));

  for (const relevantVar of newDecisions) {
    const isMine = !Boolean(relevantVar % 10);

    // Try to find a contradictory solution on the relevant var
    // I.e. if the solution states this cell should be clear check if it's possible
    // for it to be a mine
    // If a contradictory solution can't be found this cell must be correct

    // The contradictory clause
    // If the initial solution said the cell must be a mine, say it cannot be
    // Otherwise say it must be
    clauses.push(isMine ? [-relevantVar] : [mineFromVar(relevantVar)]);

    const contradictorySolution = satSolve(width * height * 10, clauses);

    // We've found a contradictory solution, can't use this cell
    if (contradictorySolution) continue;

    // No contradictory solution! Return new information gained
    if (isMine) {
      const newChecked = [cellFromVar(relevantVar), ...checked];
      const newFlagged = [cellFromVar(relevantVar), ...flagged];

      return {
        solver: Solver.Sat,
        stepTime: performance.now() - stepStart,
        checked: newChecked,
        flagged: newFlagged,
      };
    }

    const newChecked = checkTiles(
      cellFromVar(relevantVar),
      width,
      height,
      checked,
      flagged,
      neighbors
    );

    return {
      solver: Solver.Sat,
      stepTime: performance.now() - stepStart,
      checked: newChecked,
      flagged,
    };
  }

  // None of the potential solutions ended up being viable
  return false;
};
