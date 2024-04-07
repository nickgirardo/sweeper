import { render, h } from "preact";
import { Solver } from "./components/Solver.js";
import { ReqKind, PerfTestReq, genPuzzleId } from "./util/worker.js";

render(h(Solver, null, null), document.querySelector("#game-area")!);

const setupWorker = (): void => {
  if (!window.Worker) return;

  const worker = new Worker("dist/worker.js", { type: "module" });

  worker.addEventListener("message", (ev) => {
    const resp = ev.data;
    console.log("response from worker", resp);
  });

  const hardDifficulty = {
    width: 30,
    height: 16,
    mineCount: 99,
  };

  const msg: PerfTestReq = {
    kind: ReqKind.PerfTest,
    id: genPuzzleId(),
    puzzleArgs: hardDifficulty,
    startingTile: 0,
    iterations: 2000,
  };

  console.log("sending message", msg);
  worker.postMessage(msg);
};

setupWorker();
