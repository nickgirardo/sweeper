import { mineCounterSolver } from "./mineCounter.js";
import { simpleSolver } from "./simple.js";
import { subsetSolver } from "./subset.js";
import { patternSolver } from "./pattern.js";

export type CheckResult = {
  flagged: Array<number>;
  checked: Array<number>;
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

type SolutionStep = CheckResult & {
  stepTime: number;
  solver: Solver;
};

export const solveBoard = (
  width: number,
  height: number,
  mineCount: number,
  neighbors: Array<number>,
  checked: Array<number>,
  flagged: Array<number>
): Solution => {
  const puzzleStart = performance.now();
  const steps: Array<SolutionStep> = [];
  let currentChecked = checked;
  let currentFlagged = flagged;

  const puzzleComplete = () => currentChecked.length === width * height;

  while (!puzzleComplete()) {
    const setpStart = performance.now();

    // First attempt to find simple/ trivial solutions
    const simpleResult = simpleSolver(
      width,
      height,
      neighbors,
      currentChecked,
      currentFlagged
    );

    if (simpleResult) {
      steps.push({
        solver: Solver.Simple,
        stepTime: performance.now() - setpStart,
        ...simpleResult,
      });
      currentChecked = simpleResult.checked;
      currentFlagged = simpleResult.flagged;

      continue;
    }

    const subsetResult = subsetSolver(
      width,
      height,
      neighbors,
      currentChecked,
      currentFlagged
    );

    if (subsetResult) {
      steps.push({
        solver: Solver.Subset,
        stepTime: performance.now() - setpStart,
        ...subsetResult,
      });
      currentChecked = subsetResult.checked;
      currentFlagged = subsetResult.flagged;

      continue;
    }

    const patternSolverResult = patternSolver(
      width,
      height,
      neighbors,
      currentChecked,
      currentFlagged
    );

    if (patternSolverResult) {
      steps.push({
        solver: Solver.Pattern,
        stepTime: performance.now() - setpStart,
        ...patternSolverResult,
      });
      currentChecked = patternSolverResult.checked;
      currentFlagged = patternSolverResult.flagged;

      continue;
    }

    const mineCounterResult = mineCounterSolver(
      width,
      height,
      mineCount,
      neighbors,
      currentChecked,
      currentFlagged
    );

    if (mineCounterResult) {
      steps.push({
        solver: Solver.MineCounter,
        stepTime: performance.now() - setpStart,
        ...mineCounterResult,
      });
      currentChecked = mineCounterResult.checked;
      currentFlagged = mineCounterResult.flagged;

      continue;
    }

    // None of our solvers have produced any new information
    // We've failed to solve the puzzle
    return { solves: false, totalTime: performance.now() - puzzleStart, steps };
  }

  return { solves: true, totalTime: performance.now() - puzzleStart, steps };
};
