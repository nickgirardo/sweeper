import { FunctionComponent } from "preact";

import { range } from "../util/index.js";

interface PregameTileProps {
  onClick: () => void;
  onMouseEnter: () => void;
}

const PregameTile: FunctionComponent<PregameTileProps> = (props) => (
  <div
    className="tile"
    onClick={props.onClick}
    onMouseEnter={props.onMouseEnter}
  />
);

interface PregameGridProps {
  width: number;
  height: number;
  handleSelectTile: (tile: number) => void;
  handleHoverTile: (tile: number) => void;
}

export const PregameGrid: FunctionComponent<PregameGridProps> = (props) => (
  <div
    className="grid"
    style={{ gridTemplateColumns: `repeat(${props.width}, 1fr)` }}
  >
    {range(props.width * props.height).map((n) => (
      <PregameTile
        onClick={() => props.handleSelectTile(n)}
        onMouseEnter={() => props.handleHoverTile(n)}
      />
    ))}
  </div>
);
