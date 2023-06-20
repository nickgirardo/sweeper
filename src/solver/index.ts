import { satSolver } from "./sat.js";
import { simpleSolver } from "./simple.js";
import { subsetSolver } from "./subset.js";

export enum Solver {
  Simple = "simple",
  Subset = "subset",
  Sat = "sat",
}

export interface Solution {
  solves: boolean;
  steps: Array<SolutionStep>;
}
export interface SolutionStep {
  flagged: Array<number>;
  checked: Array<number>;
  stepTime: number;
  solver: Solver;
}

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
    // First attempt to find simple/ trivial solutions
    const simpleResult = simpleSolver(
      width,
      height,
      neighbors,
      currentChecked,
      currentFlagged
    );

    if (simpleResult) {
      steps.push(simpleResult);
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
      steps.push(subsetResult);
      currentChecked = subsetResult.checked;
      currentFlagged = subsetResult.flagged;

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

    steps.push(satResult);
    currentChecked = satResult.checked;
    currentFlagged = satResult.flagged;
  }

  return { solves: true, steps };
};
