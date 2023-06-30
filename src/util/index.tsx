export const range = (n: number): Array<number> => [...new Array(n).keys()];

export const classNames = (...rest: Array<string | false>): string =>
  rest.filter((arg: string | false): arg is string => arg !== false).join(" ");

export const assertNever = <T,>(x: never): T => {
  throw new Error("Received never: " + x);
};

// Wichman-Hill PRNG
export class Rand {
  x: number;
  y: number;
  z: number;

  constructor(seed: number) {
    this.x = (171 * seed) % 30269;
    this.y = (172 * (seed + 1)) % 30307;
    this.z = (170 * (seed + 2)) % 30323;
  }

  next(): number {
    this.x = (171 * this.x) % 30269;
    this.y = (172 * this.y) % 30307;
    this.z = (170 * this.z) % 30323;
    return Math.abs(
      (this.x / 30269.0 + this.y / 30307.0 + this.z / 30323.0) % 1.0
    );
  }
}
