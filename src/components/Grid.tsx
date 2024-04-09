import { FunctionComponent } from "preact";
import { Signal, useComputed } from "@preact/signals";

import { Puzzle } from "../puzzle.js";
import { range } from "../util/index.js";

import { Tile } from "./Tile.js";

interface Props {
  width: number;
  height: number;
  mineCount: number;
  startingTile: number;
  puzzle: Signal<Puzzle>;
}

export const Grid: FunctionComponent<Props> = (props) => {
  const { checked, flagged } = useComputed(() =>
    props.puzzle.value.dumpState()
  ).value;

  const checkTile = (tile: number) => {
    props.puzzle.value.checkTile(tile);

    // Force update (shallow equality changed)
    props.puzzle.value = props.puzzle.value.clone();
  };

  const flagTile = (tile: number) => {
    if (checked.isSet(tile) && !flagged.isSet(tile)) return;

    props.puzzle.value.flagTile(tile);

    // Force update (shallow equality changed)
    props.puzzle.value = props.puzzle.value.clone();
  };

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${props.width}, 1fr)` }}
    >
      {range(props.width * props.height).map((n) => (
        <Tile
          neighbors={props.puzzle.value.neighbors[n]}
          isChecked={checked.isSet(n)}
          isMine={props.puzzle.value.mines.includes(n)}
          isFlagged={flagged.isSet(n)}
          handleCheck={() => checkTile(n)}
          handleFlag={() => flagTile(n)}
        />
      ))}
    </div>
  );
};
