import { FunctionComponent } from "preact";
import { signal } from "@preact/signals";

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

const state = signal<AppState>({ stage: Stage.Setup });

export const App: FunctionComponent<{}> = () => {
  switch (state.value.stage) {
    case Stage.Setup:
      return (
        <Setup
          completeSetup={(width, height, mineCount) =>
            (state.value = {
              stage: Stage.PreGame,
              width,
              height,
              mineCount,
            })
          }
        />
      );
    case Stage.PreGame:
      return (
        <PregameGrid
          width={state.value.width}
          height={state.value.height}
          handleSelectTile={(tile: number) =>
            (state.value = {
              stage: Stage.Game,
              width: (state.value as PreGameState).width,
              height: (state.value as PreGameState).height,
              mineCount: (state.value as PreGameState).mineCount,
              startingTile: tile,
            })
          }
        />
      );
    case Stage.Game:
      return (
        <Grid
          width={(state.value as GameState).width}
          height={(state.value as GameState).height}
          mineCount={(state.value as GameState).mineCount}
          startingTile={(state.value as GameState).startingTile}
        />
      );
    case Stage.PostGame:
      return (
        <button onClick={() => (state.value = { stage: Stage.Setup })}>
          PostGame
        </button>
      );
  }
};
