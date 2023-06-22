import { render, h } from "preact";
import { Solver } from "./components/Solver.js";

render(h(Solver, null, null), document.querySelector("#game-area")!);

const setupWorker = (): void => {
  if (!window.Worker) return;

  const worker = new Worker("dist/worker.js", { type: "module" });

  const start = performance.now();
  worker.postMessage(void 0);

  worker.addEventListener("message", (ev) => {
    const resp = ev.data;
    console.log(
      `received from worker: ${resp}, after ${performance.now() - start}ms`
    );
  });
};

setupWorker();
