export class CachedResource<R> {
  private cache: Record<string, Promise<R>> = {};

  constructor(private accessor: (key: string) => Promise<R>) {}

  get(key: string): Promise<R> {
    return (this.cache[key] ??= new Promise<R>((resolve, reject) =>
      this.accessor(key)
        .then(resolve)
        .catch((reason) => {
          delete this.cache[key];
          reject(reason);
        })
    ));
  }

  set(key: string, value: Promise<R>): void {
    this.cache[key] = value;
  }

  getCached(key: string): Promise<R> | undefined {
    return this.cache[key];
  }

  has(key: string): boolean {
    return key in this.cache;
  }

  delete(key: string): boolean {
    const changed = key in this.cache;
    delete this.cache[key];
    return changed;
  }
}
