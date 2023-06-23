import { mineCounterSolver } from "./mineCounter.js";
import { simpleSolver } from "./simple.js";
import { subsetSolver } from "./subset.js";
import { patternSolver } from "./pattern.js";
import { Puzzle } from "../puzzle.js";
import { union } from "../util/array.js";
import { checkTiles } from "../util/index.js";

export type CheckResult = {
  safeToCheck: Array<number>;
  safeToFlag: Array<number>;
};

export enum Solver {
  Simple = "simple",
  Subset = "subset",
  Pattern = "pattern",
  MineCounter = "mine-counter",
}

export interface Solution {
  solves: boolean;
  steps: Array<SolutionStep>;
  totalTime: number;
}

type SolutionStep = {
  stepTime: number;
  solver: Solver;
  checked: Array<number>;
  flagged: Array<number>;
};

export const solveBoard = (puzzle: Puzzle): Solution => {
  const { width, height } = puzzle;

  const puzzleStart = performance.now();
  const steps: Array<SolutionStep> = [];

  const puzzleComplete = () => puzzle.checked.length === width * height;

  const solvers: Array<[(p: Puzzle) => CheckResult | false, Solver]> = [
    [simpleSolver, Solver.Simple],
    [subsetSolver, Solver.Subset],
    [patternSolver, Solver.Pattern],
    [mineCounterSolver, Solver.MineCounter],
  ];

  outer: while (!puzzleComplete()) {
    const setpStart = performance.now();

    for (const [solver, solverUsed] of solvers) {
      const result = solver(puzzle);

      if (!result) continue;

      if (result.safeToCheck.length === 0 && result.safeToFlag.length === 0)
        throw new Error("no change :(");

      for (const t of result.safeToCheck) {
        puzzle.checked = checkTiles(t, puzzle);
      }

      puzzle.checked = union(puzzle.checked, result.safeToFlag);

      puzzle.flagged = union(puzzle.flagged, result.safeToFlag);

      steps.push({
        solver: solverUsed,
        stepTime: performance.now() - setpStart,
        checked: [...puzzle.checked],
        flagged: [...puzzle.flagged],
      });

      continue outer;
    }

    // None of our solvers have produced any new information
    // We've failed to solve the puzzle
    return { solves: false, totalTime: performance.now() - puzzleStart, steps };
  }

  return { solves: true, totalTime: performance.now() - puzzleStart, steps };
};
