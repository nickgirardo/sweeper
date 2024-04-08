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
  PuzzleId,
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
  #channel = new MessageChannel();
  workQueue: Array<number> = [];
  running: boolean = false;
  // Map from starting tile to valid seed
  processed: Map<number, number> = new Map();
  // If set, return the puzzle by starting tile when possible
  returnPuzzle: number | null = null;

  id: PuzzleId;

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

    this.#channel.port1.onmessage = () => this.work();
  }

  stop() {
    this.running = false;
    this.workQueue = [];
    this.returnPuzzle = null;
  }

  exec() {
    if (this.running) return;

    this.running = true;

    this.runWork();
  }

  // Queuing a task (not a microtask) is necessary here so that we're interrupted by incoming messages
  runWork() {
    this.#channel.port2.postMessage("");
  }

  // Do the actual work
  // There are two types of tasks that this does
  // - Find a seed which produces a solvable puzzle for a given starting tile
  // - Return a puzzle to the main thread
  //
  // The latter task takes priority.  If the latter task completes or if the work queue (consumed by the first
  // task) is empty the worker stops its loop
  //
  // While the worker loops by calling itself, it's important that it does so by queueing a full task rather than
  // just calling recursively or by queueing a microtask.  This is so the worker can be interrupted by new
  // messages from the main thread
  work() {
    if (this.running === false) return;

    // Have we been requested to return puzzle and we've already solved it?
    if (this.returnPuzzle !== null && this.processed.has(this.returnPuzzle)) {
      // TODO return actual puzzle rather than seed
      // this will allow future optimizations
      const resp: GenPuzzleResp = {
        kind: RespKind.GenPuzzle,
        id: this.id,
        startingTile: this.returnPuzzle,
        // NOTE asserting here as we've checked with `has` above
        seed: this.processed.get(this.returnPuzzle)!,
      };

      postMessage(resp);

      this.stop();
      return;
    }

    let startingTile;
    do {
      startingTile = this.workQueue.shift();

      if (startingTile === undefined) {
        this.stop();
        return;
      }
    } while (this.processed.has(startingTile));

    this.solvePuzzle(startingTile);

    this.runWork();
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
        this.processed.set(startingTile, seed);

        return;
      }
    }
  }
}

let workers: Map<PuzzleId, SweepWorker> = new Map();

const preparePuzzle = (req: PreparePuzzleReq) => {
  const sweepWorker = new SweepWorker(
    req.id,
    req.puzzleArgs.width,
    req.puzzleArgs.height,
    req.puzzleArgs.mineCount,
    req.startingSeed
  );

  workers.set(req.id, sweepWorker);

  sweepWorker.workQueue = [
    ...new Array(req.puzzleArgs.width * req.puzzleArgs.height).keys(),
  ];

  sweepWorker.exec();
};

const prioritizeTile = (req: PrioritizeTileReq) => {
  const sweepWorker = workers.get(req.id);
  if (sweepWorker === undefined) {
    console.error(`Worker with id "${req.id}" not found!`);
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
  const sweepWorker = workers.get(req.id);
  if (sweepWorker === undefined) {
    console.error(`Worker with id "${req.id}" not found!`);
    return;
  }

  sweepWorker.workQueue = [req.tile];
  sweepWorker.returnPuzzle = req.tile;
  sweepWorker.exec();
};

const abortPuzzleSolve = (req: AbortReq) => {
  const sweepWorker = workers.get(req.id);
  if (sweepWorker === undefined) {
    console.error(`Worker with id "${req.id}" not found!`);
    return;
  }

  sweepWorker.workQueue = [];

  workers.delete(req.id);
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
