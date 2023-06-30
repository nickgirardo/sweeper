import { solveBoard } from "./solver/index.js";
import { Puzzle } from "./puzzle.js";
import { Rand, range } from "./util/index.js";

onmessage = (_ev: MessageEvent<any>): void => {
  console.log("worker: starting");

  const width = 30;
  const height = 16;
  const mineCount = 99;
  const startingTile = 0;

  const solvable: Array<number> = [];
  const unsolvable: Array<number> = [];

  const stepCounts = {
    simple: 0,
    pattern: 0,
    subset: 0,
    "mine-counter": 0,
    "border-sat": 0,
  };

  for (const seed of range(1000)) {
    if (seed % 50 === 0) console.log(seed);
    const puzzle = new Puzzle(
      width,
      height,
      mineCount,
      startingTile,
      new Rand(seed)
    );

    puzzle.checkTile(startingTile);
    const solution = solveBoard(puzzle);

    if (solution.solves) {
      for (const step of solution.steps) {
        stepCounts[step.solver]++;
      }
    }

    if (solution.solves && !puzzle.checkSolution(solution))
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
