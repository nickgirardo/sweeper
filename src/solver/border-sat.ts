import satSolve from "boolean-sat";

import { CheckResult } from "./index.js";
import { Puzzle } from "../puzzle.js";

import { Clause, nOf } from "../util/solver.js";

class Translator {
  #map: Map<number, number>;
  #reverse: Map<number, number>;
  size: number;

  constructor() {
    this.#map = new Map();
    this.#reverse = new Map();
    this.size = 0;
  }

  set(t: number) {
    if (this.#map.has(t)) return;
    this.#map.set(t, this.#map.size + 1);
    this.#reverse.set(this.#reverse.size + 1, t);

    this.size++;
  }

  get = (t: number): number | undefined => this.#map.get(t);

  getReverse = (t: number): number | undefined => this.#reverse.get(t);
}

const boundryClauses = (puzzle: Puzzle): [Array<Clause>, Translator] => {
  const { boundryCells, remainingNeighbors, neighboringCells, checked } =
    puzzle;

  let clauses: Array<Clause> = [];

  const translator = new Translator();

  for (const t of boundryCells) {
    const constrainedUnknowns = neighboringCells[t].filter((t) =>
      checked.isUnset(t)
    );
    for (const c of constrainedUnknowns) {
      translator.set(c);
    }
    clauses = clauses.concat(
      nOf(
        remainingNeighbors[t],
        constrainedUnknowns.map((t) => translator.get(t)!)
      )
    );
  }

  return [clauses, translator];
};

export const borderSatSolver = (puzzle: Puzzle): CheckResult | false => {
  if (!puzzle.boundryCells.length) return false;

  const [initialClauses, translator] = boundryClauses(puzzle);

  const initialSolution = satSolve(translator.size, initialClauses);

  if (!initialSolution) return false;

  const safeToCheck: Array<number> = [];
  const safeToFlag: Array<number> = [];

  for (let i = 1; i < initialSolution.length; i++) {
    let learnedClauses: Array<Clause> = [];
    const contradictoryLiteral = initialSolution[i] ? -i : i;
    const contradictoryClause = [contradictoryLiteral];

    const clauses = [...initialClauses, ...learnedClauses, contradictoryClause];
    const solution = satSolve(translator.size, clauses);

    if (!solution) {
      learnedClauses.push([contradictoryLiteral * -1]);
      if (initialSolution[i]) safeToFlag.push(translator.getReverse(i)!);
      else if (!initialSolution[i]) safeToCheck.push(translator.getReverse(i)!);
    }
  }

  if (!safeToCheck.length && !safeToFlag.length) return false;

  return { safeToCheck, safeToFlag };
};
