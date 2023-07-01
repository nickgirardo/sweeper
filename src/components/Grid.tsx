import { FunctionComponent } from "preact";
import { useEffect } from "preact/hooks";
import { Signal, batch, useSignal } from "@preact/signals";

import { Puzzle } from "../puzzle.js";
import { range, Rand } from "../util/index.js";

import { Tile } from "./Tile.js";

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
  const checked = useSignal<Array<boolean>>([]);
  const flagged = useSignal<Array<boolean>>([]);

  // Generate grid
  useEffect(() => {
    let newPuzzle = new Puzzle(
      props.width,
      props.height,
      props.mineCount,
      props.startingTile,
      new Rand(performance.now())
    );
    const puzzleState = newPuzzle.dumpState();

    batch(() => {
      puzzle.value = newPuzzle;
      checked.value = puzzleState.checked;
      flagged.value = puzzleState.flagged;
    });
  }, [props.startingTile]);

  const checkTile = (tile: number) => {
    if (!puzzle.value) return;

    puzzle.value.checkTile(tile);
    const puzzleState = puzzle.value.dumpState();

    batch(() => {
      checked.value = puzzleState.checked;
      flagged.value = puzzleState.flagged;
    });
  };

  const flagTile = (tile: number) => {
    if (!puzzle.value || (checked.value[tile] && !flagged.value[tile])) return;

    puzzle.value.flagTile(tile);

    const puzzleState = puzzle.value.dumpState();

    batch(() => {
      checked.value = puzzleState.checked;
      flagged.value = puzzleState.flagged;
    });
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
          isChecked={checked.value[n]}
          isMine={puzzle.value.mines.has(n)}
          isFlagged={flagged.value[n]}
          handleCheck={() => checkTile(n)}
          handleFlag={() => flagTile(n)}
        />
      ))}
    </div>
  );
};
