export const difference = <T>(a: Array<T>, b: Array<T>): Array<T> =>
  a.filter((t) => !b.includes(t));

export const intersection = <T>(a: Array<T>, b: Array<T>): Array<T> =>
  a.filter((t) => b.includes(t));
