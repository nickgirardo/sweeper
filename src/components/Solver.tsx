import { FunctionComponent } from "preact";

import { Signal, signal } from "@preact/signals";
import { useMemo } from "preact/hooks";

import { solveBoard, Solver as SolverUsed } from "../solver/index.js";
import { Rand } from "../util/index.js";
import { Puzzle } from "../puzzle.js";

import { DisplayGrid } from "./DisplayGrid.js";

const seed = signal<number>(0);
const width = signal<number>(16);
const height = signal<number>(16);
const mineCount = signal<number>(40);

export const ValueAdjustor: FunctionComponent<{
  label: string;
  sig: Signal<number>;
}> = (props) => (
  <div>
    {props.label}:
    <button onClick={() => (props.sig.value = props.sig.value - 1)}>-1</button>
    {props.sig}
    <button onClick={() => (props.sig.value = props.sig.value + 1)}>+1</button>
  </div>
);

export const Solver: FunctionComponent<{}> = () => {
  // For now, hardcoding starting tile as 0
  const startingTile = 0;

  const [initialPuzzle, puzzle] = useMemo(
    () => [
      new Puzzle(
        width.value,
        height.value,
        mineCount.value,
        startingTile,
        new Rand(seed.value)
      ),
      new Puzzle(
        width.value,
        height.value,
        mineCount.value,
        startingTile,
        new Rand(seed.value)
      ),
    ],
    [seed.value, width.value, height.value, mineCount.value]
  );

  const solution = useMemo(() => solveBoard(puzzle), [initialPuzzle]);

  const finalBoard = solution.puzzle;

  return (
    <div>
      <div className="controls">
        <ValueAdjustor label="Seed" sig={seed} />
        <ValueAdjustor label="Width" sig={width} />
        <ValueAdjustor label="Height" sig={height} />
        <ValueAdjustor label="Mine Count" sig={mineCount} />
      </div>
      <br />
      <div>Puzzle{solution.solves ? "" : " NOT"} solvable!</div>
      {solution.solves && (
        <div>
          Solution{" "}
          {initialPuzzle.checkSolution(solution) ? "correct" : "INCORRECT!!"}
        </div>
      )}
      <div className="report">
        <div>Total time: {solution.totalTime}ms</div>
        <div>Total steps: {solution.steps.length}</div>
        <div>
          Simple steps:{" "}
          {solution.steps.filter((s) => s.solver === SolverUsed.Simple).length}
        </div>
        <div>
          Subset steps:{" "}
          {solution.steps.filter((s) => s.solver === SolverUsed.Subset).length}
        </div>
        <div>
          Pattern steps:{" "}
          {solution.steps.filter((s) => s.solver === SolverUsed.Pattern).length}
        </div>
        <div>
          Mine counter steps:{" "}
          {
            solution.steps.filter((s) => s.solver === SolverUsed.MineCounter)
              .length
          }
        </div>
        <div>
          Border SAT steps:{" "}
          {
            solution.steps.filter((s) => s.solver === SolverUsed.BorderSat)
              .length
          }
        </div>
      </div>
      <DisplayGrid
        width={width.value}
        height={height.value}
        checked={initialPuzzle.checked}
        neighbors={initialPuzzle.neighbors}
        flagged={[]}
      />
      {finalBoard && (
        <DisplayGrid
          width={width.value}
          height={height.value}
          checked={finalBoard.checked}
          neighbors={finalBoard.neighbors}
          flagged={finalBoard.flagged}
        />
      )}
      <DisplayGrid
        width={width.value}
        height={height.value}
        checked={new Array(width.value * height.value).fill(true)}
        neighbors={initialPuzzle.neighbors}
        flagged={new Array(width.value * height.value)
          .fill(false)
          .map((_, ix) => initialPuzzle.mines.has(ix))}
      />
    </div>
  );
};
