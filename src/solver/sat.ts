import satSolve from "boolean-sat";

import { CheckResult } from "./index.js";
import { range, checkTiles, getNeighbors } from "../util/index.js";
import { Clause, nOf } from "../util/solver.js";
import { Puzzle } from "../puzzle.js";

const baseClauses = ({
  width,
  height,
  mineCount,
  checked,
  flagged,
  neighbors,
}: Puzzle): Array<Clause> => {
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

export const satSolver = (puzzle: Puzzle): CheckResult | false => {
  const { width, height, checked } = puzzle;

  const cellFromVar = (satVar: number): number => Math.floor((satVar - 1) / 10);
  const mineFromVar = (satVar: number): number =>
    (cellFromVar(satVar) + 1) * 10;

  const clauses = baseClauses(puzzle);
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
    if (isMine)
      return {
        safeToCheck: [],
        safeToFlag: [cellFromVar(relevantVar)],
      };

    puzzle.checked = checkTiles(cellFromVar(relevantVar), puzzle);

    return {
      safeToCheck: [cellFromVar(relevantVar)],
      safeToFlag: [],
    };
  }

  // None of the potential solutions ended up being viable
  return false;
};
