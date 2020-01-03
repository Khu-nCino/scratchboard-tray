// export default class PersistManager<S extends object, K extends keyof S> {
//   private watchedProperties: K[];
//   private previousValues: Record<K, S[K]> = {}

//   constructor(watch: K[]) {
//     this.watchedProperties = watch;
//   }

//   private sync(store: S) {
//     return this.watchedProperties.reduce((prev, k) => {
//       const changed = this.previousValues[k] !== store[k];
//       this.previousValues[k] = store[k];
//       return prev || changed;
//     }, false);
//   }
// }
