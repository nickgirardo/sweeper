import { solveBoard } from "./solver/index.js";
import { Puzzle } from "./puzzle.js";
import { Rand, assertNever, range } from "./util/index.js";
import {
  GenPuzzleReq,
  ReqKind,
  PerfTestReq,
  isSweepReq,
  RespKind,
  PerfTestResp,
  GenPuzzleResp,
} from "./util/worker.js";

onmessage = (ev: MessageEvent<any>): void => {
  const data = ev.data;

  if (!isSweepReq(data)) {
    postMessage("Bad Message");
    return;
  }

  switch (data.kind) {
    case ReqKind.PerfTest:
      perfTest(data);
      return;
    case ReqKind.GenPuzzle:
      genPuzzle(data);
      return;
    default:
      assertNever(data);
  }
};

// TODO
const genPuzzle = (req: GenPuzzleReq) => {
  const { width, height, mineCount, startingTile } = req.puzzleArgs;

  const start = performance.now();
  for (let seed = req.startingSeed; ; seed++) {
    const puzzle = new Puzzle(
      width,
      height,
      mineCount,
      startingTile,
      new Rand(seed)
    );

    const solution = solveBoard(puzzle);

    if (solution.solves && puzzle.checkSolution(solution)) {
      const resp: GenPuzzleResp = {
        kind: RespKind.GenPuzzle,
        id: req.id,
        startingTile,
        seed,
        elapsed: performance.now() - start,
        skipped: seed - req.startingSeed,
      };
      postMessage(resp);

      return;
    }
  }
};

const perfTest = (req: PerfTestReq) => {
  const start = performance.now();

  const { width, height, mineCount, startingTile } = req.puzzleArgs;

  let solvable = 0;

  for (const seed of range(req.iterations)) {
    const puzzle = new Puzzle(
      width,
      height,
      mineCount,
      startingTile,
      new Rand(seed)
    );

    const solution = solveBoard(puzzle);

    if (solution.solves && !puzzle.checkSolution(solution))
      console.log(
        "something went wrong",
        seed,
        solution.puzzle.flagged,
        puzzle.mines
      );

    if (solution.solves) solvable++;
  }

  const resp: PerfTestResp = {
    kind: RespKind.PerfTest,
    id: req.id,
    timeElapsed: performance.now() - start,
    solved: solvable / req.iterations,
  };

  postMessage(resp);
};
