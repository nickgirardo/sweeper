import { FunctionComponent } from "preact";
import { useEffect } from "preact/hooks";
import { useSignal, batch } from "@preact/signals";

import { genBoard } from "../puzzle.js";
import { range, checkTiles, Rand } from "../util/index.js";

import { Tile } from "./Tile.js";

interface Props {
  width: number;
  height: number;
  mineCount: number;
  startingTile: number;
}

export const Grid: FunctionComponent<Props> = (props) => {
  const mines = useSignal<Array<number>>([]);
  const neighbors = useSignal<Array<number>>([]);
  const checkedTiles = useSignal<Array<number>>([]);
  const flaggedTiles = useSignal<Array<number>>([]);

  // Generate grid
  useEffect(() => {
    const [newMines, newNeighbors] = genBoard(
      props.width,
      props.height,
      props.mineCount,
      props.startingTile,
      new Rand(performance.now())
    );

    batch(() => {
      mines.value = newMines;
      neighbors.value = newNeighbors;

      // Start the puzzle with the starting tile checked
      checkedTiles.value = checkTiles(
        props.startingTile,
        props.width,
        props.height,
        [],
        [],
        newNeighbors
      );
    });
  }, [props.startingTile]);

  const checkTile = (tile: number) => {
    checkedTiles.value = checkTiles(
      tile,
      props.width,
      props.height,
      checkedTiles.value,
      flaggedTiles.value,
      neighbors.value
    );
  };

  const flagTile = (tile: number) => {
    if (checkedTiles.value.includes(tile)) return;

    flaggedTiles.value = flaggedTiles.value.includes(tile)
      ? flaggedTiles.value.filter((id: number) => id !== tile)
      : [tile, ...flaggedTiles.value];
  };

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${props.width}, 1fr)` }}
    >
      {range(props.width * props.height).map((n) => (
        <Tile
          neighbors={neighbors.value[n]}
          isChecked={checkedTiles.value.includes(n)}
          isMine={mines.value.includes(n)}
          isFlagged={flaggedTiles.value.includes(n)}
          handleCheck={() => checkTile(n)}
          handleFlag={() => flagTile(n)}
        />
      ))}
    </div>
  );
};
