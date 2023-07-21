export class Bitset {
  #bits: Uint8Array;
  setCount: number;
  unsetCount: number;

  constructor(size: number, startingValue: boolean = false) {
    this.#bits = new Uint8Array(size);
    this.setCount = startingValue ? size : 0;
    this.unsetCount = startingValue ? 0 : size;

    if (startingValue) {
      this.#bits.fill(1);
    }
  }

  clone(): Bitset {
    const ret = new Bitset(this.#bits.length);
    ret.#bits = new Uint8Array(this.#bits);

    return ret;
  }

  static fromArray(size: number, set: Array<number>): Bitset {
    const ret = new Bitset(size);
    for (const t of set) ret.set(t);

    return ret;
  }

  *[Symbol.iterator]() {
    for (const b of this.#bits) yield b;
  }

  isSet = (bit: number): boolean => !!this.#bits[bit];
  isUnset = (bit: number): boolean => !this.#bits[bit];

  set(bit: number) {
    if (this.#bits[bit]) return;

    this.#bits[bit] = 1;
    this.setCount++;
    this.unsetCount--;
  }

  unset(bit: number) {
    if (!this.#bits[bit]) return;

    this.#bits[bit] = 0;
    this.setCount--;
    this.unsetCount++;
  }

  getSetIndicies = (): Array<number> => {
    const ret = [];
    for (let i = 0; i < this.#bits.length; i++)
      if (!!this.#bits[i]) ret.push(i);
    return ret;
  };

  getUnsetIndicies = (): Array<number> => {
    const ret = [];
    for (let i = 0; i < this.#bits.length; i++) if (!this.#bits[i]) ret.push(i);
    return ret;
  };

  // NOTE wrote this and `iterUnsetIndicies` as tests but they seem to be consistently slower than
  // just using `getSetIndicies` and `getUnsetIndices`
  iterSetIndicies = (): Iterable<number> => {
    let that = this;
    return {
      [Symbol.iterator]() {
        let i = -1;
        const iter = {
          next(): IteratorResult<number> {
            for (; i < that.#bits.length; ) {
              i++;
              if (!!that.#bits[i]) return { value: i, done: false };
            }
            return { done: true, value: undefined };
          },
        };
        return iter;
      },
    };
  };

  iterUnsetIndicies = (): Iterable<number> => {
    let that = this;
    return {
      [Symbol.iterator]() {
        let i = -1;
        const iter = {
          next(): IteratorResult<number> {
            for (; i < that.#bits.length; ) {
              i++;
              if (!that.#bits[i]) return { value: i, done: false };
            }
            return { done: true, value: undefined };
          },
        };
        return iter;
      },
    };
  };
}
