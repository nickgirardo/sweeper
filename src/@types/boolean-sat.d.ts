declare module "boolean-sat" {
  // Note that as the first variable (0) is unused (it cannot be negated)
  // so the first element in the array is always null
  export type SATSolution = [null, ...boolean[]];

  // Returns a solution if satisfiable or false if unsatisfiable
  export function satSolve(
    size: number,
    clauses: Array<Array<number>>
  ): SATSolution | false;

  // Returns a solution and clauses learned via CDCL if satisfiable
  // or false if unsatisfiable
  export function satSolveLearnClauses(
    size: number,
    clauses: Array<Array<number>>
  ): [SATResult, Array<Clause>] | false;

  export default satSolve;
}
