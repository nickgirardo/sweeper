import { FunctionComponent } from "preact";

import { Signal, signal } from "@preact/signals";
import { useMemo } from "preact/hooks";

import { solveBoard } from "../solver/index.js";
import { Rand, checkTiles, genBoard, getNeighbors } from "../util/index.js";

import { DisplayGrid } from "./DisplayGrid.js";

const seed = signal<number>(0);
const width = signal<number>(4);
const height = signal<number>(3);
const mineCount = signal<number>(2);
const useSat = signal<boolean>(false);

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
  const [_mines, neighbors] = useMemo(
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
        [],
        useSat.value
      ),
    [seed.value, width.value, height.value, mineCount.value, useSat.value]
  );

  return (
    <div>
      <ValueAdjustor label="Seed" sig={seed} />
      <ValueAdjustor label="Width" sig={width} />
      <ValueAdjustor label="Height" sig={height} />
      <ValueAdjustor label="Mine Count" sig={mineCount} />
      <label>
        <input
          type="checkbox"
          checked={useSat.value}
          //@ts-ignore
          onChange={(ev) => (useSat.value = (ev as InputEvent)!.target.checked)}
        />{" "}
        Use SAT{" "}
      </label>
      <br />
      <div>Puzzle{solution.solves ? "" : " NOT"} solvable!</div>
      <div>
        Total: {solution.steps.reduce((acc, b) => acc + b.stepTime, 0)}ms
      </div>
      <DisplayGrid
        width={width.value}
        height={height.value}
        checked={checked}
        neighbors={neighbors}
        flagged={[]}
      />
      {solution.steps.map((s) => (
        <>
          <div>
            {s.solver}, {s.stepTime}ms
          </div>
          <DisplayGrid
            width={width.value}
            height={height.value}
            checked={s.checked}
            neighbors={neighbors}
            flagged={s.flagged}
          />
        </>
      ))}
    </div>
  );
};
