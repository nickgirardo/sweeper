import { FunctionComponent } from "preact";

import { range } from "../util/index.js";

import { Tile } from "./Tile.js";

interface Props {
  width: number;
  height: number;
  checked: Array<number>;
  neighbors: Array<number>;
  flagged: Array<number>;
}

export const DisplayGrid: FunctionComponent<Props> = ({
  width,
  height,
  checked,
  neighbors,
  flagged,
}) => (
  <div
    className="grid"
    style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}
  >
    {range(width * height).map((n) => (
      <Tile
        neighbors={neighbors[n]}
        isChecked={checked.includes(n)}
        isMine={false}
        isFlagged={flagged.includes(n)}
        handleCheck={() => undefined}
        handleFlag={() => undefined}
      />
    ))}
  </div>
);
