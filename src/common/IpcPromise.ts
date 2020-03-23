import { ipcRenderer } from "electron";

// NOTE: Just an experiment.
// There's probably better implementations out there in libraries

class IdPool {
  nextId: number = 0;

  provision(): number {
    return this.nextId++;
  }

  release(identity: number) {}
}

export class IpcPromise {
  idPool = new IdPool();
  resolves = new Map<
    number,
    { resolve: (value?: any[]) => void; reject: (reason?: string) => void }
  >();
  listeners = new Map<string, (...args: any[]) => Promise<any>>();

  constructor() {
    ipcRenderer.on("PROMISE_REPLY", (event, identity, value) => {
      this.resolves.get(identity)?.resolve(value);
      this.resolves.delete(identity);

      this.idPool.release(identity);
    });

    ipcRenderer.on(
      "PROMISE_REQUEST",
      async (event, name, identity, ...args) => {
        const listener = this.listeners.get(name);
        if (listener) {
          const value = await listener(args);
          ipcRenderer.send("PROMISE_REPLY", identity, value);
        }
        ipcRenderer.send("PROMISE_REPLY", identity);
      }
    );
  }

  send(name: string, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const identity = this.idPool.provision();
      ipcRenderer.send("PROMISE_REQUEST", name, identity, args);
      this.resolves.set(identity, { resolve, reject });
    });
  }

  on(name: string, callback: (...args: any[]) => Promise<any>) {
    this.listeners.set(name, callback);
  }
}
