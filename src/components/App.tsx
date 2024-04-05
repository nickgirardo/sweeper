import { FunctionComponent } from "preact";
import { signal } from "@preact/signals";

import { Setup } from "./Setup.js";
import { Grid } from "./Grid.js";
import { PregameGrid } from "./PregameGrid.js";
import { useEffect, useState } from "preact/hooks";
import { MessageKind, genMsgId } from "../util/worker.js";

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
  seed: number;
};

type PostGameState = {
  stage: Stage.PostGame;
};

type AppState = SetupState | PreGameState | GameState | PostGameState;

const state = signal<AppState>({ stage: Stage.Setup });

export const App: FunctionComponent<{}> = () => {
  const [genPuzzleWorker, setGenPuzzleWorker] = useState<Worker | null>(null);

  const [startTile, setStartTile] = useState<null | number>(null);
  const [foundGames, setFoundGames] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    const worker = new Worker("dist/worker.js", { type: "module" });
    worker.addEventListener("message", (ev) => {
      const resp = ev.data;
      console.log("response from worker", resp);

      setFoundGames(
        (prev) =>
          new Map([...prev, [resp.req.puzzleArgs.startingTile, resp.seed]])
      );
    });
    setGenPuzzleWorker(worker);
  }, []);

  useEffect(() => {
    console.log(startTile, foundGames);
    if (startTile === null) return;

    const foundSeed = foundGames.get(startTile);
    if (foundSeed === undefined) return;

    const st = state.value as PreGameState;

    state.value = {
      stage: Stage.Game,
      width: st.width,
      height: st.height,
      mineCount: st.mineCount,
      startingTile: startTile,
      seed: foundSeed,
    };
  }, [startTile, foundGames]);

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
          handleSelectTile={(tile: number) => {
            if (!genPuzzleWorker) throw new Error("");

            // Don't allow changing the starting tile once it's chosen
            if (startTile !== null) return;

            const st = state.value as PreGameState;

            genPuzzleWorker.postMessage({
              kind: MessageKind.GenPuzzle,
              id: genMsgId(),
              puzzleArgs: {
                width: st.width,
                height: st.height,
                mineCount: st.mineCount,
                startingTile: tile,
              },
              startingSeed: performance.now(),
            });

            setStartTile(tile);
          }}
        />
      );
    case Stage.Game:
      return (
        <Grid
          width={(state.value as GameState).width}
          height={(state.value as GameState).height}
          mineCount={(state.value as GameState).mineCount}
          startingTile={(state.value as GameState).startingTile}
          seed={(state.value as GameState).seed}
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
