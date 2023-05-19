import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";

import { Grid } from "./Grid.js";
import { PregameGrid } from "./PregameGrid.js";

interface GameAreaProps {
  width: number;
  height: number;
  mines: number;
}
export const GameArea: FunctionComponent<GameAreaProps> = (props) => {
  const [startingTile, setStartingTile] = useState<number | null>(null);

  if (!startingTile)
    return (
      <PregameGrid
        width={props.width}
        height={props.height}
        handleSelectTile={setStartingTile}
      />
    );
  return (
    <Grid
      width={props.width}
      height={props.height}
      mines={props.mines}
      startingTile={startingTile}
    />
  );
};

export const GameAreaContainer = <GameArea width={30} height={16} mines={99} />;
