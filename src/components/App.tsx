import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";

import { assertNever } from "../util.js";

import { Setup } from "./Setup.js";
import { Grid } from "./Grid.js";
import { PregameGrid } from "./PregameGrid.js";

enum Stage {
  Setup = "setup",
  PreGame = "pregame",
  Game = "game",
  PostGame = "postgame",
}

type SetupState = {
  stage: Stage.Setup;
};

type PreGameState = {
  stage: Stage.PreGame;
  width: number;
  height: number;
  mineCount: number;
};

type GameState = {
  stage: Stage.Game;
  width: number;
  height: number;
  mineCount: number;
  startingTile: number;
};

type PostGameState = {
  stage: Stage.PostGame;
};

type AppState = SetupState | PreGameState | GameState | PostGameState;

export const App: FunctionComponent<{}> = () => {
  const [state, setState] = useState<AppState>({ stage: Stage.Setup });

  switch (state.stage) {
    case Stage.Setup:
      return (
        <Setup
          completeSetup={(width, height, mineCount) =>
            setState({ stage: Stage.PreGame, width, height, mineCount })
          }
        />
      );
    case Stage.PreGame:
      return (
        <PregameGrid
          width={state.width}
          height={state.height}
          handleSelectTile={(tile: number) =>
            setState({
              stage: Stage.Game,
              width: state.width,
              height: state.height,
              mineCount: state.mineCount,
              startingTile: tile,
            })
          }
        />
      );
    case Stage.Game:
      return (
        <Grid
          width={state.width}
          height={state.height}
          mineCount={state.mineCount}
          startingTile={state.startingTile}
        />
      );
    case Stage.PostGame:
      return (
        <button onClick={() => setState({ stage: Stage.Setup })}>
          PostGame
        </button>
      );
    default:
      return assertNever(state);
  }
};
