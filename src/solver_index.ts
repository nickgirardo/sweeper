import { render, h } from "preact";
import { Solver } from "./components/Solver.js";
import { solveBoard } from "./solver/index.js";
import { Puzzle } from "./puzzle.js";
import { Rand, range } from "./util/index.js";

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
/*

{
 const width = 16;
 const height = 16;
 const mineCount = 40;
 const startingTile = 0;

 const solvable: Array<number> = [];
 const unsolvable: Array<number> = [];

 const stepCounts = {
   simple: 0,
   pattern: 0,
   subset: 0,
   "mine-counter": 0,
 };

 for (const seed of range(1000)) {
   if (seed % 50 === 0) console.log(seed);
   const puzzle = new Puzzle(
     width,
     height,
     mineCount,
     startingTile,
     new Rand(seed)
   );

   puzzle.checkTile(startingTile);
   const solution = solveBoard(puzzle);

   if (solution.solves) {
     for (const step of solution.steps) {
       stepCounts[step.solver]++;
     }
   }

   if (solution.solves && !puzzle.checkSolution(solution))
     console.log(
       "something went wrong",
       seed,
       solution.puzzle.flagged,
       puzzle.mines
     );

   if (solution.solves) solvable.push(seed);
   else unsolvable.push(seed);
 }

 console.log(stepCounts);
}

*/
