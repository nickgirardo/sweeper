import { FunctionComponent } from "preact";

interface Props {
  completeSetup: (width: number, height: number, mineCount: number) => void;
}

export const Setup: FunctionComponent<Props> = (props) => (
  <div className="setup">
    <button onClick={() => props.completeSetup(8, 8, 10)}>8x8, 10 mines</button>
    <button onClick={() => props.completeSetup(16, 16, 40)}>
      16x16, 40 mines
    </button>
    <button onClick={() => props.completeSetup(30, 16, 99)}>
      30x16, 99 mines
    </button>
  </div>
);
