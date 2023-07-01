export class Bitset {
  #bits: Array<boolean>;
  setCount: number;
  unsetCount: number;

  constructor(size: number, startingValue: boolean = false) {
    this.#bits = new Array(size).fill(startingValue);
    this.setCount = startingValue ? size : 0;
    this.unsetCount = startingValue ? 0 : size;
  }

  static fromBitArray(bits: Array<boolean>): Bitset {
    const ret = new Bitset(bits.length);
    ret.#bits = bits;

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

  isSet = (bit: number): boolean => this.#bits[bit];
  isUnset = (bit: number): boolean => !this.#bits[bit];

  set(bit: number) {
    if (this.#bits[bit]) return;

    this.#bits[bit] = true;
    this.setCount++;
    this.unsetCount--;
  }

  unset(bit: number) {
    if (!this.#bits[bit]) return;

    this.#bits[bit] = false;
    this.setCount--;
    this.unsetCount++;
  }

  // TODO might be a better way to write all of these
  getSetIndicies = (): Array<number> =>
    this.#bits.map((t, ix) => (t ? ix : -1)).filter((t) => t !== -1);

  getUnsetIndicies = (): Array<number> =>
    this.#bits.map((t, ix) => (t ? -1 : ix)).filter((t) => t !== -1);
}
