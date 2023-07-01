import { solveBoard } from "./solver/index.js";
import { Puzzle } from "./puzzle.js";
import { Rand, assertNever, range } from "./util/index.js";
import {
  GenPuzzleMessage,
  MessageKind,
  PerfTestMessage,
  SweepMsg,
} from "./util/worker.js";

const isExpectedData = (data: any): data is SweepMsg =>
  data.kind && Object.values(MessageKind).includes(data.kind as MessageKind);

onmessage = (ev: MessageEvent<any>): void => {
  const data = ev.data;

  if (!isExpectedData(data)) {
    postMessage("Bad Message");
    return;
  }

  switch (data.kind) {
    case MessageKind.PerfTest:
      perfTest(data);
      return;
    case MessageKind.GenPuzzle:
      genPuzzle(data);
      return;
    default:
      assertNever(data);
  }
};

// TODO
const genPuzzle = (msg: GenPuzzleMessage) => {
  console.warn("genPuzzle: unimplemented!", msg);
};

const perfTest = (msg: PerfTestMessage) => {
  const start = performance.now();

  const { width, height, mineCount, startingTile } = msg.puzzleArgs;

  let solvable = 0;

  for (const seed of range(msg.iterations)) {
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

  postMessage({
    id: msg.id,
    timeElapsed: performance.now() - start,
    solved: solvable / msg.iterations,
  });
};
