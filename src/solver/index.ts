import { mineCounterSolver } from "./mineCounter.js";
import { satSolver } from "./sat.js";
import { simpleSolver } from "./simple.js";
import { subsetSolver } from "./subset.js";

export type CheckResult = {
  flagged: Array<number>;
  checked: Array<number>;
};

export enum Solver {
  Simple = "simple",
  Subset = "subset",
  Sat = "sat",
  MineCounter = "mine-counter",
}

export interface Solution {
  solves: boolean;
  steps: Array<SolutionStep>;
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
  flagged: Array<number>,
  useSat: boolean
): Solution => {
  const steps: Array<SolutionStep> = [];
  let currentChecked = checked;
  let currentFlagged = flagged;

  const puzzleComplete = () => currentChecked.length === width * height;

  while (!puzzleComplete()) {
    const start = performance.now();

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
        stepTime: performance.now() - start,
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
        stepTime: performance.now() - start,
        ...subsetResult,
      });
      currentChecked = subsetResult.checked;
      currentFlagged = subsetResult.flagged;

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
        stepTime: performance.now() - start,
        ...mineCounterResult,
      });
      currentChecked = mineCounterResult.checked;
      currentFlagged = mineCounterResult.flagged;

      continue;
    }

    if (!useSat) return { solves: false, steps };

    // If we weren't able to find a simple solution
    // Fallback to using a SAT solver
    // This is more thorough but more computationally expensive
    const satResult = satSolver(
      width,
      height,
      mineCount,
      neighbors,
      currentChecked,
      currentFlagged
    );

    if (!satResult) return { solves: false, steps };

    steps.push({
      solver: Solver.Sat,
      stepTime: performance.now() - start,
      ...satResult,
    });
    currentChecked = satResult.checked;
    currentFlagged = satResult.flagged;
  }

  return { solves: true, steps };
};
