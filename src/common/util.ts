export function arrayDiff<T>(next: T[], prev: T[]) {
  const nextSet = next.reduce((acc, x) => {
    acc.add(x);
    return acc;
  }, new Set<T>());

  const prevSet = prev.reduce((acc, y) => {
    acc.add(y);
    return acc;
  }, new Set<T>());

  return {
    added: next.filter((x) => !prevSet.has(x)),
    removed: prev.filter((x) => !nextSet.has(x)),
  };
}

export function binaryGroups<T>(xs: T[], func: (x: T) => boolean): [T[], T[]] {
  return [xs.filter(func), xs.filter((x) => !func(x))];
}
