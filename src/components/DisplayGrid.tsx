import { FunctionComponent } from "preact";

import { range } from "../util/index.js";

import { Tile } from "./Tile.js";

interface Props {
  width: number;
  height: number;
  neighbors: Array<number>;
  checked: Array<boolean>;
  flagged: Array<boolean>;
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
        isChecked={checked[n]}
        isMine={false}
        isFlagged={flagged[n]}
        handleCheck={() => undefined}
        handleFlag={() => undefined}
      />
    ))}
  </div>
);
