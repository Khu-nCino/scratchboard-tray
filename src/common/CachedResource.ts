export class CachedResource<R> {
  private cache: Record<string, R> = {};

  constructor(private accessor: (key: string) => R) {}

  get(key: string): R {
    return this.cache[key] ?? (this.cache[key] = this.accessor(key));
  }

  getCached(key: string): R | undefined {
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
