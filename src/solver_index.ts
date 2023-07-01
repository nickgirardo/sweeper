import { render, h } from "preact";
import { Solver } from "./components/Solver.js";
import { MessageKind, PerfTestMessage, genMsgId } from "./util/worker.js";

render(h(Solver, null, null), document.querySelector("#game-area")!);

const setupWorker = (): void => {
  if (!window.Worker) return;

  const worker = new Worker("dist/worker.js", { type: "module" });

  worker.addEventListener("message", (ev) => {
    const resp = ev.data;
    console.log("response from worker", resp);
  });

  const msg: PerfTestMessage = {
    kind: MessageKind.PerfTest,
    id: genMsgId(),
    puzzleArgs: { width: 16, height: 16, mineCount: 40, startingTile: 0 },
    iterations: 2000,
  };

  console.log("sending message", msg);
  worker.postMessage(msg);
};

setupWorker();
