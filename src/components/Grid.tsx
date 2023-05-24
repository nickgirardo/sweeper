import { FunctionComponent } from "preact";
import { useEffect, useState } from "preact/hooks";

import {
  range,
  getNeighbors as uGetNeighbors,
  checkTiles as uCheckTiles,
} from "../util.js";

import { Tile } from "./Tile.js";

interface Props {
  width: number;
  height: number;
  mineCount: number;
  startingTile: number;
}

export const Grid: FunctionComponent<Props> = (props) => {
  const getNeighbors = (tile: number) =>
    uGetNeighbors(tile, props.width, props.height);

  const [mines, setMines] = useState<Array<number>>([]);
  const [neighbors, setNeighbors] = useState<Array<number>>([]);
  const [checkedTiles, setCheckedTiles] = useState<Array<number>>([]);
  const [flaggedTiles, setFlaggedTiles] = useState<Array<number>>([]);

  // Generate grid
  useEffect(() => {
    const totalCells = props.width * props.height;
    // Don't generate any mines in the tiles around the starting tile
    const freeTiles = [props.startingTile, ...getNeighbors(props.startingTile)];

    const mines: Array<number> = [];
    while (mines.length < props.mineCount) {
      const location = Math.floor(Math.random() * totalCells);
      if (!freeTiles.includes(location) && !mines.includes(location))
        mines.push(location);
    }

    // Easier for me to reason about, probably not needed
    mines.sort((a, b) => a - b);

    // Calculate neighbors
    const neighbors = new Array(totalCells).fill(0);
    for (const mine of mines) {
      getNeighbors(mine).forEach((tile) => neighbors[tile]++);
    }

    setMines(mines);
    setNeighbors(neighbors);

    setCheckedTiles(
      uCheckTiles(
        props.startingTile,
        props.width,
        props.height,
        [],
        [],
        neighbors
      )
    );
  }, [props.startingTile]);

  const checkTile = (tile: number) => {
    setCheckedTiles(
      uCheckTiles(
        tile,
        props.width,
        props.height,
        checkedTiles,
        flaggedTiles,
        neighbors
      )
    );
  };

  const flagTile = (tile: number) => {
    if (checkedTiles.includes(tile)) return;

    setFlaggedTiles((prev: Array<number>) => {
      if (prev.includes(tile)) return prev.filter((id: number) => id !== tile);
      return [tile, ...prev];
    });
  };

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${props.width}, 1fr)` }}
    >
      {range(props.width * props.height).map((n) => (
        <Tile
          neighbors={neighbors[n]}
          isChecked={checkedTiles.includes(n)}
          isMine={mines.includes(n)}
          isFlagged={flaggedTiles.includes(n)}
          handleCheck={() => checkTile(n)}
          handleFlag={() => flagTile(n)}
        />
      ))}
    </div>
  );
};
