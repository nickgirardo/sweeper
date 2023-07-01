type MessageId = number;

export type PuzzleArgs = {
  width: number;
  height: number;
  mineCount: number;
  startingTile: number;
};

export type PerfTestMessage = {
  kind: MessageKind.PerfTest;
  id: MessageId;
  puzzleArgs: PuzzleArgs;
  iterations: number;
};

export type GenPuzzleMessage = {
  kind: MessageKind.GenPuzzle;
  id: MessageId;
  puzzleArgs: PuzzleArgs;
  startingSeed: number;
};

export enum MessageKind {
  PerfTest = "perf-test",
  GenPuzzle = "gen-board",
}

export type SweepMsg = PerfTestMessage | GenPuzzleMessage;

// Might want something a bit more sophisticated here lol
export const genMsgId: () => MessageId = Math.random;
