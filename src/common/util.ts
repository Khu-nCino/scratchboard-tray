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

export function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

export function notConcurrent<T>(proc: () => PromiseLike<T>) {
  let inFlight: Promise<T> | false = false;

  return () => {
    if (!inFlight) {
      inFlight = (async () => {
        try {
          return await proc();
        } finally {
          inFlight = false;
        }
      })();
    }
    return inFlight;
  };
}

export function shrink(strings: TemplateStringsArray, ...placeholders: any[]) {
  const withSpace = strings.reduce((result, string, i) => result + placeholders[i - 1] + string);
  return withSpace.trim().replace(/\s\s+/g, " ");
}
