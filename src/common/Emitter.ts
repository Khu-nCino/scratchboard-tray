// TODO use standard nodejs events
type Listener<E> = (event: E) => Promise<void>;

export class Emitter<E> {
  private listeners: Listener<E>[] = [];

  addListener(listener: Listener<E>) {
    this.listeners.push(listener);
  }

  emit(event: E): Promise<any> {
    return Promise.allSettled(this.listeners.map((listener) => listener(event)));
  }
}
