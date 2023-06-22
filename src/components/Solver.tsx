import { FunctionComponent } from "preact";

import { Signal, signal } from "@preact/signals";
import { useMemo } from "preact/hooks";

import { solveBoard, Solver as SolverUsed } from "../solver/index.js";
import { Rand, checkTiles, genBoard, getNeighbors } from "../util/index.js";

import { DisplayGrid } from "./DisplayGrid.js";
import { isSolutionCorrect } from "../util/solver.js";

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
  const startingTile = 0;

  // For now, hardcoding starting tile as 0
  const freeTiles = [
    startingTile,
    ...getNeighbors(startingTile, width.value, height.value),
  ];
  const [mines, neighbors] = useMemo(
    () =>
      genBoard(
        width.value,
        height.value,
        mineCount.value,
        freeTiles,
        new Rand(seed.value)
      ),
    [seed.value, width.value, height.value, mineCount.value]
  );
  const checked = checkTiles(
    startingTile,
    width.value,
    height.value,
    [],
    [],
    neighbors
  );

  const solution = useMemo(
    () =>
      solveBoard(
        width.value,
        height.value,
        mineCount.value,
        neighbors,
        checked,
        []
      ),
    [seed.value, width.value, height.value, mineCount.value]
  );

  const finalBoard = solution.steps.at(-1);

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
          {isSolutionCorrect(solution, mines) ? "correct" : "INCORRECT!!"}
        </div>
      )}
      <div className="report">
        <div>Total time: {solution.totalTime}ms</div>
        <div>Total steps: {solution.steps.length}</div>
        <div>
          Simple stpes:{" "}
          {solution.steps.filter((s) => s.solver === SolverUsed.Simple).length}
        </div>
        <div>
          Subset stpes:{" "}
          {solution.steps.filter((s) => s.solver === SolverUsed.Subset).length}
        </div>
        <div>
          Mine counter stpes:{" "}
          {
            solution.steps.filter((s) => s.solver === SolverUsed.MineCounter)
              .length
          }
        </div>
      </div>
      <DisplayGrid
        width={width.value}
        height={height.value}
        checked={checked}
        neighbors={neighbors}
        flagged={[]}
      />
      {finalBoard && (
        <DisplayGrid
          width={width.value}
          height={height.value}
          checked={finalBoard.checked}
          neighbors={neighbors}
          flagged={finalBoard.flagged}
        />
      )}
    </div>
  );
};
