type MessageId = number;

export type PuzzleArgs = {
  width: number;
  height: number;
  mineCount: number;
  startingTile: number;
};

export enum ReqKind {
  PerfTest = "perf-test-req",
  GenPuzzle = "gen-board-req",
}

export type PerfTestReq = {
  kind: ReqKind.PerfTest;
  id: MessageId;
  puzzleArgs: PuzzleArgs;
  iterations: number;
};

export type GenPuzzleReq = {
  kind: ReqKind.GenPuzzle;
  id: MessageId;
  puzzleArgs: PuzzleArgs;
  startingSeed: number;
};

export type SweepReq = PerfTestReq | GenPuzzleReq;

export enum RespKind {
  PerfTest = "perf-test-resp",
  GenPuzzle = "gen-board-resp",
}

export type PerfTestResp = {
  kind: RespKind.PerfTest;
  id: MessageId;
  timeElapsed: number;
  solved: number;
};

export type GenPuzzleResp = {
  kind: RespKind.GenPuzzle;
  id: MessageId;
  startingTile: number;
  seed: number;
  elapsed: number;
  skipped: number;
};

export type SweepResp = PerfTestResp | GenPuzzleResp;

// Might want something a bit more sophisticated here lol
export const genMsgId: () => MessageId = Math.random;

export const isSweepReq = (data: any): data is SweepReq =>
  data.kind && Object.values(ReqKind).includes(data.kind as ReqKind);

export const isSweepResp = (data: any): data is SweepResp =>
  data.kind && Object.values(RespKind).includes(data.kind as RespKind);
