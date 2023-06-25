export const setDifference = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const ret = new Set<T>();
  for (const el of a) if (!b.has(el)) ret.add(el);

  return ret;
};

export const setIntersection = <T>(a: Set<T>, b: Set<T>): Set<T> => {
  const ret = new Set<T>();
  for (const el of a) if (b.has(el)) ret.add(el);

  return ret;
};

export const setEvery = <T>(xs: Set<T>, p: (arg0: T) => boolean): boolean => {
  for (const x of xs) if (!p(x)) return false;

  return true;
};

export const difference = <T>(a: Array<T>, b: Array<T>): Array<T> =>
  a.filter((t) => !b.includes(t));

export const intersection = <T>(a: Array<T>, b: Array<T>): Array<T> =>
  a.filter((t) => b.includes(t));

export const areMutuallyExclusive = <T>(a: Set<T>, b: Set<T>): boolean =>
  setEvery(a, (t) => !b.has(t));

/*
export const isSubsetOf = <T>(a: Array<T>, b: Array<T>): boolean =>
  a.every((t) => b.includes(t));
  */

export const isSubsetOf = <T>(a: Set<T>, b: Set<T>): boolean =>
  setEvery(a, (t) => b.has(t));

export const isProperSubsetOf = <T>(a: Set<T>, b: Set<T>): boolean =>
  a.size < b.size && isSubsetOf(a, b);

export const uniq = <T>(a: Array<T>): Array<T> =>
  a.filter((t, ix) => !a.slice(ix + 1).includes(t));

export const isUniq = <T>(a: Array<T>): boolean =>
  a.every((t, ix) => !a.slice(ix + 1).includes(t));

export const union = <T>(a: Array<T>, b: Array<T>): Array<T> =>
  uniq(a.concat(b));

export const sumBy = <T>(a: Array<T>, fn: (arg0: T) => number): number =>
  a.reduce((acc, t) => acc + fn(t), 0);

// NOTE implementing as generator to avoid having to calculate entire list ahead of time
export function* subsequences<T>(xs: Array<T>): Generator<Array<T>> {
  let list: Array<Array<T>> = [[]];
  let next: Array<Array<T>> = [[]];

  yield [];
  for (const x of xs) {
    for (const el of list) {
      yield [x, ...el];
      next.push([x, ...el]);
    }

    list = [...next];
  }
}

export function* subsequencesOfMaxLength<T>(
  xs: Array<T>,
  maxLength: number
): Generator<Array<T>> {
  let list: Array<Array<T>> = [[]];
  let next: Array<Array<T>> = [[]];

  yield [];
  for (const x of xs) {
    for (const el of list) {
      const subseq = [...el, x];
      yield subseq;
      if (subseq.length < maxLength) next.push([x, ...el]);
    }

    list = [...next];
  }
}

export function* subsetsOfMaxLength<T>(
  xs: Set<T>,
  maxLength: number
): Generator<Array<T>> {
  let list: Array<Array<T>> = [[]];
  let next: Array<Array<T>> = [[]];

  yield [];
  for (const x of xs) {
    for (const el of list) {
      const subseq = [...el, x];
      yield subseq;
      if (subseq.length < maxLength) next.push([x, ...el]);
    }

    list = [...next];
  }
}
