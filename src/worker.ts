import { solveBoard } from "./solver/index.js";
import {
  Rand,
  checkTiles,
  genBoard,
  getNeighbors,
  range,
} from "./util/index.js";
import { isSolutionCorrect } from "./util/solver.js";

onmessage = (_ev: MessageEvent<any>): void => {
  console.log("worker: starting");
  const width = 16;
  const height = 16;
  const mineCount = 40;
  const startingTile = 0;

  const solvable: Array<number> = [];
  const unsolvable: Array<number> = [];

  const freeTiles = [
    startingTile,
    ...getNeighbors(startingTile, width, height),
  ];

  for (const seed of range(1000)) {
    const [mines, neighbors] = genBoard(
      width,
      height,
      mineCount,
      freeTiles,
      new Rand(seed)
    );

    const checked = checkTiles(startingTile, width, height, [], [], neighbors);
    const solution = solveBoard(
      width,
      height,
      mineCount,
      neighbors,
      checked,
      []
    );

    if (solution.solves && !isSolutionCorrect(solution, mines))
      console.log(
        "something went wrong",
        seed,
        solution.steps.at(-1)!.flagged,
        mines
      );

    if (solution.solves) solvable.push(seed);
    else unsolvable.push(seed);
  }
  postMessage([solvable.length, unsolvable.length]);
};
