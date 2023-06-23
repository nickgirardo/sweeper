import { solveBoard } from "./solver/index.js";
import { genBoard } from "./puzzle.js";
import { Rand, checkTiles, range } from "./util/index.js";

import { isSolutionCorrect } from "./util/solver.js";

onmessage = (_ev: MessageEvent<any>): void => {
  console.log("worker: starting");

  const width = 16;
  const height = 16;
  const mineCount = 40;
  const startingTile = 0;

  const solvable: Array<number> = [];
  const unsolvable: Array<number> = [];

  const stepCounts = {
    simple: 0,
    subset: 0,
    pattern: 0,
    "mine-counter": 0,
  };

  for (const seed of range(1000)) {
    if (seed % 50 === 0) console.log(seed);
    const puzzle = genBoard(
      width,
      height,
      mineCount,
      startingTile,
      new Rand(seed)
    );

    puzzle.checked = checkTiles(startingTile, puzzle);
    const solution = solveBoard(puzzle);

    if (solution.solves) {
      for (const step of solution.steps) {
        stepCounts[step.solver]++;
      }
    }

    if (solution.solves && !isSolutionCorrect(solution, puzzle.mines))
      console.log(
        "something went wrong",
        seed,
        solution.puzzle.flagged,
        puzzle.mines
      );

    if (solution.solves) solvable.push(seed);
    else unsolvable.push(seed);
  }

  console.log(stepCounts);

  postMessage([solvable.length, unsolvable.length]);
};
