import { solveBoard } from "./solver/index.js";
import { Puzzle } from "./puzzle.js";
import { Rand, assertNever, range } from "./util/index.js";
import {
  ReqKind,
  PerfTestReq,
  isSweepReq,
  RespKind,
  PerfTestResp,
  GenPuzzleResp,
  PreparePuzzleReq,
  AbortReq,
  TileChosenReq,
  PrioritizeTileReq,
} from "./util/worker.js";

onmessage = (ev: MessageEvent<any>): void => {
  const data = ev.data;

  if (!isSweepReq(data)) {
    postMessage("Bad Message");
    return;
  }

  console.log("got message!");

  switch (data.kind) {
    case ReqKind.PerfTest:
      perfTest(data);
      return;
    case ReqKind.PreparePuzzle:
      preparePuzzle(data);
      return;
    case ReqKind.PrioritizeTile:
      prioritizeTile(data);
      return;
    case ReqKind.TileChosen:
      tileChosen(data);
      return;
    case ReqKind.Abort:
      abortPuzzleSolve(data);
      return;
    default:
      assertNever(data);
  }
};

class SweepWorker {
  workQueue: Array<number> = [];
  processed: Set<number> = new Set();
  running: boolean = false;
  id: number;

  // puzzle settings
  width: number;
  height: number;
  mineCount: number;
  startingSeed: number;

  constructor(
    id: number,
    width: number,
    height: number,
    mineCount: number,
    startingSeed: number
  ) {
    this.id = id;
    this.width = width;
    this.height = height;
    this.mineCount = mineCount;
    this.startingSeed = startingSeed;
  }

  exec() {
    if (this.running) return;

    this.running = true;

    // TODO remove for better browser support
    // Queuing a task (not microtask) is necessary here so that we're interrupted by incoming messages
    //@ts-ignore
    scheduler.postTask(() => this.work());
  }

  work() {
    let startingTile;
    do {
      startingTile = this.workQueue.shift();

      if (startingTile === undefined) return;
    } while (this.processed.has(startingTile));

    this.solvePuzzle(startingTile);
    this.processed.add(startingTile);

    //@ts-ignore
    scheduler.postTask(() => this.work());
  }

  solvePuzzle(startingTile: number) {
    for (let seed = this.startingSeed; ; seed++) {
      const puzzle = new Puzzle(
        this.width,
        this.height,
        this.mineCount,
        startingTile,
        new Rand(seed)
      );

      const solution = solveBoard(puzzle);

      if (solution.solves && puzzle.checkSolution(solution)) {
        const resp: GenPuzzleResp = {
          kind: RespKind.GenPuzzle,
          id: this.id,
          startingTile,
          seed,
        };

        // TODO perhaps it would be better to only send responses when tile is selected
        postMessage(resp);

        return;
      }
    }
  }
}

// TODO instead of a single global worker, have series of workers per puzzle
// and deallocate workers in abort msg
let sweepWorker: SweepWorker;

const preparePuzzle = (req: PreparePuzzleReq) => {
  sweepWorker = new SweepWorker(
    req.id,
    req.puzzleArgs.width,
    req.puzzleArgs.height,
    req.puzzleArgs.mineCount,
    req.startingSeed
  );

  sweepWorker.workQueue = [
    ...new Array(req.puzzleArgs.width * req.puzzleArgs.height).keys(),
  ];

  sweepWorker.exec();
};

const prioritizeTile = (req: PrioritizeTileReq) => {
  if (sweepWorker === undefined) {
    console.error("Please initialize the worker first");
    return;
  }

  const ix = sweepWorker.workQueue.indexOf(req.tile);

  // Should we do something here?
  if (ix === -1) return;

  // Remove the old entry from the queue
  sweepWorker.workQueue.splice(ix, 1);

  sweepWorker.workQueue.unshift(req.tile);
  sweepWorker.exec();
};

const tileChosen = (req: TileChosenReq) => {
  if (sweepWorker === undefined) {
    console.error("Please initialize the worker first");
    return;
  }

  sweepWorker.workQueue = [req.tile];
  sweepWorker.exec();
};

const abortPuzzleSolve = (_req: AbortReq) => {
  if (sweepWorker === undefined) {
    console.error("Please initialize the worker first");
    return;
  }

  sweepWorker.workQueue = [];
};

const perfTest = (req: PerfTestReq) => {
  const start = performance.now();

  const { width, height, mineCount } = req.puzzleArgs;
  const startingTile = req.startingTile;

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
