import { FunctionComponent } from "preact";
import { useEffect } from "preact/hooks";
import { Signal, useSignal } from "@preact/signals";

import { Puzzle, genBoard } from "../puzzle.js";
import { range, checkTiles, Rand } from "../util/index.js";

import { Tile } from "./Tile.js";
import { difference } from "../util/array.js";

interface Props {
  width: number;
  height: number;
  mineCount: number;
  startingTile: number;
}

const puzzleIsReady = (
  puzzle: Signal<Puzzle | null>
): puzzle is Signal<Puzzle> => Boolean(puzzle.value);

export const Grid: FunctionComponent<Props> = (props) => {
  const puzzle = useSignal<Puzzle | null>(null);

  // Generate grid
  useEffect(() => {
    let newPuzzle = genBoard(
      props.width,
      props.height,
      props.mineCount,
      props.startingTile,
      new Rand(performance.now())
    );

    newPuzzle = {
      ...newPuzzle,
      checked: checkTiles(props.startingTile, newPuzzle),
    };

    puzzle.value = newPuzzle;
  }, [props.startingTile]);

  const checkTile = (tile: number) => {
    if (!puzzle.value) return;

    puzzle.value = {
      ...puzzle.value,
      checked: checkTiles(tile, puzzle.value),
    };
  };

  const flagTile = (tile: number) => {
    if (!puzzle.value || puzzle.value.checked.includes(tile)) return;

    puzzle.value = {
      ...puzzle.value,
      flagged: puzzle.value.flagged.includes(tile)
        ? difference(puzzle.value.flagged, [tile])
        : [tile, ...puzzle.value.flagged],
    };
  };

  // NOTE not 100% sure why I need to be so specific here in narrowing this type
  if (!puzzleIsReady(puzzle)) return <></>;

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${props.width}, 1fr)` }}
    >
      {range(props.width * props.height).map((n) => (
        <Tile
          neighbors={puzzle.value.neighbors[n]}
          isChecked={puzzle.value.checked.includes(n)}
          isMine={puzzle.value.mines.includes(n)}
          isFlagged={puzzle.value.flagged.includes(n)}
          handleCheck={() => checkTile(n)}
          handleFlag={() => flagTile(n)}
        />
      ))}
    </div>
  );
};
