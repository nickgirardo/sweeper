import { FunctionComponent } from "preact";

import { Bitset } from "../util/bitset.js";
import { range } from "../util/index.js";

import { Tile } from "./Tile.js";

interface Props {
  width: number;
  height: number;
  neighbors: Array<number>;
  checked: Bitset;
  flagged: Bitset;
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
        isChecked={checked.isSet(n)}
        isMine={false}
        isFlagged={flagged.isSet(n)}
        handleCheck={() => undefined}
        handleFlag={() => undefined}
      />
    ))}
  </div>
);
