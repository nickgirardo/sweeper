export const difference = <T>(a: Array<T>, b: Array<T>): Array<T> =>
  a.filter((t) => !b.includes(t));

export const intersection = <T>(a: Array<T>, b: Array<T>): Array<T> =>
  a.filter((t) => b.includes(t));

// NOTE this could be written as `intersection(a, b).length === 0`
// using `.every` instead should allow it to exit early on finding a match
export const areMutuallyExclusive = <T>(a: Array<T>, b: Array<T>): boolean =>
  a.every((t) => !b.includes(t));

export const isSubsetOf = <T>(a: Array<T>, b: Array<T>): boolean =>
  a.every((t) => b.includes(t));

export const isProperSubsetOf = <T>(a: Array<T>, b: Array<T>): boolean =>
  a.length < b.length && isSubsetOf(a, b);

export const uniq = <T>(a: Array<T>): Array<T> =>
  a.filter((t, ix) => !a.slice(ix + 1).includes(t));

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
