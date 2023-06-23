import { Solution } from "../solver/index.js";
import { difference } from "./array.js";
import {
  popcount,
  popcount32,
  checkBit,
  getVal,
  increment,
} from "./bitjank.js";

export type Clause = Array<number>;

export const isSolutionCorrect = (
  solution: Solution,
  mines: Array<number>
): boolean =>
  solution.puzzle.flagged.length === mines.length &&
  difference(solution.puzzle.flagged, mines).length === 0;

function* nOfGen32(n: number, vars: Array<number>): Generator<Clause> {
  for (let i = 0; i < 2 ** vars.length; i++) {
    if (popcount32(i) === n) continue;

    const clause = [];
    for (const [ix, v] of vars.entries()) {
      let bitVal = Boolean(i & (1 << ix));
      clause.push(bitVal ? -v : v);
    }
    yield clause;
  }
}

function* nOfGen(n: number, vars: Array<number>): Generator<Clause> {
  const counter = new Uint32Array(Math.ceil(vars.length / 32));
  const iters = 2n ** BigInt(vars.length);

  for (; getVal(counter) < iters; increment(counter)) {
    if (popcount(counter) === n) continue;

    const clause = [];
    for (const [ix, v] of vars.entries()) {
      let bitVal = checkBit(counter, ix);
      clause.push(bitVal ? -v : v);
    }
    yield clause;
  }
}

export const nOf = (n: number, vars: Array<number>): Array<Clause> =>
  n < 32 ? Array.from(nOfGen32(n, vars)) : Array.from(nOfGen(n, vars));
