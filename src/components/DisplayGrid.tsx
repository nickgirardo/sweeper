import { FunctionComponent } from "preact";

import { range } from "../util/index.js";

import { Tile } from "./Tile.js";

interface Props {
  width: number;
  height: number;
  checked: Set<number>;
  neighbors: Array<number>;
  flagged: Set<number>;
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
        isChecked={checked.has(n)}
        isMine={false}
        isFlagged={flagged.has(n)}
        handleCheck={() => undefined}
        handleFlag={() => undefined}
      />
    ))}
  </div>
);
