export const popcount32 = (n: number): number => {
  n = n - ((n >> 1) & 0x55555555);
  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
  return (((n + (n >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
};

export const popcount = (buffer: Uint32Array): number =>
  buffer.reduce((acc, b) => acc + popcount32(b), 0);

export const getVal = (buffer: Uint32Array): bigint =>
  buffer.reduce((acc, b) => (acc << 32n) | BigInt(b), 0n);

export const increment = (buffer: Uint32Array) => {
  for (let i = buffer.length - 1; i >= 0; i--) {
    // Do we need to overflow?
    if (buffer[i] === 0xffff_ffff) {
      buffer[i] = 0;
      continue;
    }
    buffer[i]++;
    return;
  }
};

export const checkBit = (buffer: Uint32Array, i: number): boolean => {
  const relevantArrayEntry = buffer[Math.floor(i / 32)];
  const bitToCheck = i & 31;
  return Boolean(relevantArrayEntry & (1 << bitToCheck));
};
