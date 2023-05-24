import { render, h } from "preact";
import { App } from "./components/App.js";

render(h(App, null, null), document.querySelector("#game-area")!);
