export const range = (n: number): Array<number> => [...new Array(n).keys()];

export const getNeighbors = (
  tile: number,
  width: number,
  height: number
): Array<number> => {
  const x = tile % width;
  const y = (tile - x) / width;

  return [
    // West tile
    x !== 0 && tile - 1,
    // East tile
    x !== width - 1 && tile + 1,
    // North tile
    y !== 0 && tile - width,
    // South tile
    y !== height - 1 && tile + width,
    // NW tile
    x !== 0 && y !== 0 && tile - width - 1,
    // NE tile
    x !== width - 1 && y !== 0 && tile - width + 1,
    // SW tile
    x !== 0 && y !== height - 1 && tile + width - 1,
    // SE tile
    x !== width - 1 && y !== height - 1 && tile + width + 1,
  ].filter((n): n is number => n !== false);
};

export const classNames = (...rest: Array<string | false>): string =>
  rest.filter((arg: string | false): arg is string => arg !== false).join(" ");
