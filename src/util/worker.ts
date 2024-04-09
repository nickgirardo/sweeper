import { Quadrant } from "../puzzle";

export const workerInstance = new Worker(
  new URL("../worker", import.meta.url),
  {
    type: "module",
  }
);

export type PuzzleId = number;

export type PuzzleArgs = {
  width: number;
  height: number;
  mineCount: number;
};

export enum ReqKind {
  PerfTest = "perf-test-req",
  PreparePuzzle = "prepare-board-req",
  PrioritizeTile = "prioritize-tile-req",
  TileChosen = "tile-chosen-req",
  Abort = "abort-req",
}

export type PerfTestReq = {
  kind: ReqKind.PerfTest;
  id: PuzzleId;
  puzzleArgs: PuzzleArgs;
  startingTile: number;
  iterations: number;
};

export type PreparePuzzleReq = {
  kind: ReqKind.PreparePuzzle;
  id: PuzzleId;
  puzzleArgs: PuzzleArgs;
  startingSeed: number;
};

export type PrioritizeTileReq = {
  kind: ReqKind.PrioritizeTile;
  id: PuzzleId;
  tile: number;
};

export type TileChosenReq = {
  kind: ReqKind.TileChosen;
  id: PuzzleId;
  tile: number;
};

export type AbortReq = {
  kind: ReqKind.Abort;
  id: PuzzleId;
  tile: number;
};

export type SweepReq =
  | PerfTestReq
  | PreparePuzzleReq
  | PrioritizeTileReq
  | TileChosenReq
  | AbortReq;

export enum RespKind {
  Test = "test",
  PerfTest = "perf-test-resp",
  GenPuzzle = "gen-board-resp",
}

export type PerfTestResp = {
  kind: RespKind.PerfTest;
  id: PuzzleId;
  timeElapsed: number;
  solved: number;
};

// TODO rm debugging fields
export type GenPuzzleResp = {
  kind: RespKind.GenPuzzle;
  id: PuzzleId;
  startingTile: number;
  seed: number;
  quadrant: Quadrant;
};

export type SweepResp = PerfTestResp | GenPuzzleResp;

// Might want something a bit more sophisticated here lol
export const genPuzzleId: () => PuzzleId = Math.random;

export const isSweepReq = (data: any): data is SweepReq =>
  data.kind && Object.values(ReqKind).includes(data.kind as ReqKind);

export const isSweepResp = (data: any): data is SweepResp =>
  data.kind && Object.values(RespKind).includes(data.kind as RespKind);
