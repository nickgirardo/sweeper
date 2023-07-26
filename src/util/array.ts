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

export const areMutuallyExclusive = <T>(a: Array<T>, b: Array<T>): boolean =>
  a.every((t) => !b.includes(t));

export const isSubsetOf = <T>(a: Array<T>, b: Array<T>): boolean =>
  a.every((t) => b.includes(t));

export const isProperSubsetOf = <T>(a: Array<T>, b: Array<T>): boolean =>
  a.length < b.length && isSubsetOf(a, b);

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

// A much more readable but slightly slower version of the below
/*
export function* subsequencesOfMaxLength4<T>(
  xs: Array<T>
): Generator<Array<T>> {
  yield [];
  for (let i = 0; i < xs.length; i++) {
    yield [xs[i]];
    for (let j = i + 1; j < xs.length; j++) {
      yield [xs[i], xs[j]];
      for (let k = j + 1; k < xs.length; k++) {
        yield [xs[i], xs[j], xs[k]];
        for (let l = k + 1; l < xs.length; l++) {
          yield [xs[i], xs[j], xs[k], xs[l]];
        }
      }
    }
  }
}
*/

// I know this is the ugliest and jankies fn ever written but it's fast enough that I feel compelled
// to keep it around :(
export function subsequencesOfMaxLength4<T>(xs: Array<T>): Iterable<Array<T>> {
  return {
    [Symbol.iterator]() {
      let i = -1;
      let j = -1;
      let k = -1;
      let l = -1;
      return {
        next(): IteratorResult<Array<T>> {
          if (i === -1) {
            i = 0;
            return { done: false, value: [] };
          }
          if (i === xs.length) return { done: true, value: undefined };
          if (j === -1) {
            j = i + 1;
            return { done: false, value: [xs[i]] };
          }
          if (j === xs.length) {
            i++;
            j = -1;
            return this.next();
          }
          if (k === -1) {
            k = j + 1;
            return { done: false, value: [xs[i], xs[j]] };
          }
          if (k === xs.length) {
            j++;
            k = -1;
            return this.next();
          }
          if (l === -1) {
            l = k + 1;
            return { done: false, value: [xs[i], xs[j], xs[k]] };
          }
          if (l === xs.length) {
            k++;
            l = -1;
            return this.next();
          }
          l++;
          return { done: false, value: [xs[i], xs[j], xs[k], xs[l - 1]] };
        },
      };
    },
  };
}

export function* subsequencesOfMaxLengthN<T>(
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
