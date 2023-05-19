import { FunctionComponent } from "preact";
import { classNames } from "../util.js";

interface Props {
  neighbors: number;
  isChecked: boolean;
  isMine: boolean;
  isFlagged: boolean;
  handleCheck: () => void;
  handleFlag: () => void;
}

export const Tile: FunctionComponent<Props> = (props) => {
  const clickHandler = (ev: MouseEvent) =>
    ev.button === 0 ? props.handleCheck() : props.handleFlag();

  return (
    <div
      onContextMenu={(ev) => ev.preventDefault()}
      className={classNames(
        "tile",
        props.isFlagged && "flagged",
        props.isChecked && props.isMine && "mine",
        props.isChecked && !props.isMine && `neighbors-${props.neighbors}`
      )}
      // NOTE right click doesn't seem to work with onClick
      onMouseUp={clickHandler}
    />
  );
};
