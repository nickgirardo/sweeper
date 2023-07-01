import { Puzzle } from "../puzzle.js";

import { mineCounterSolver } from "./mineCounter.js";
import { simpleSolver } from "./simple.js";
import { subsetSolver } from "./subset.js";
import { patternSolver } from "./pattern.js";
import { borderSatSolver } from "./border-sat.js";

export type CheckResult = {
  safeToCheck: Array<number>;
  safeToFlag: Array<number>;
};

export enum Solver {
  Simple = "simple",
  Subset = "subset",
  Pattern = "pattern",
  MineCounter = "mine-counter",
  BorderSat = "border-sat",
}

export interface Solution {
  solves: boolean;
  steps: Array<SolutionStep>;
  puzzle: Puzzle;
  totalTime: number;
}

type SolutionStep = {
  stepTime: number;
  solver: Solver;
};

export const solveBoard = (puzzle: Puzzle): Solution => {
  const { width, height } = puzzle;

  const puzzleStart = performance.now();
  const steps: Array<SolutionStep> = [];

  const puzzleComplete = () => puzzle.checked.setCount === width * height;

  const solvers: Array<[(p: Puzzle) => CheckResult | false, Solver]> = [
    [simpleSolver, Solver.Simple],
    [patternSolver, Solver.Pattern],
    [subsetSolver, Solver.Subset],
    [mineCounterSolver, Solver.MineCounter],
    [borderSatSolver, Solver.BorderSat],
  ];

  outer: while (!puzzleComplete()) {
    const setpStart = performance.now();

    for (const [solver, solverUsed] of solvers) {
      const result = solver(puzzle);

      if (!result) continue;

      if (result.safeToCheck.length === 0 && result.safeToFlag.length === 0)
        continue;

      puzzle.updatePuzzle(result.safeToCheck, result.safeToFlag);

      steps.push({
        solver: solverUsed,
        stepTime: performance.now() - setpStart,
      });

      continue outer;
    }

    // None of our solvers have produced any new information
    // We've failed to solve the puzzle
    return {
      solves: false,
      puzzle,
      totalTime: performance.now() - puzzleStart,
      steps,
    };
  }

  return {
    solves: true,
    puzzle,
    totalTime: performance.now() - puzzleStart,
    steps,
  };
};
