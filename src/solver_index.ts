import { render, h } from "preact";
import { Solver } from "./components/Solver.js";

render(h(Solver, null, null), document.querySelector("#game-area")!);
