
interface Timeout {
  date: number;
  timeoutId: number;
  handler: () => void;
}

class TimeoutManager {
  timeoutSet = new Set<Timeout>();

  sync() {
    const now = Date.now();
    this.timeoutSet.forEach((timeout) => {
      window.clearTimeout(timeout.timeoutId);
      
      const timeLeft = timeout.date - now;
      if (timeLeft < 0) {
        timeout.handler();
      } else {
        timeout.timeoutId = window.setTimeout(() => {
          this.timeoutSet.delete(timeout);
          timeout.handler();
        }, timeLeft);
      }
    })
  }

  setTimeout(handler: () => void, delay: number): Timeout {
    const timeout: Timeout = {
      date: Date.now() + delay,
      handler,
      timeoutId: window.setTimeout(() => {
        this.timeoutSet.delete(timeout);
        handler();
      }, delay),
    };

    this.timeoutSet.add(timeout);
    return timeout;
  }

  clearTimeout(timeout: Timeout) {
    this.timeoutSet.delete(timeout);
    window.clearTimeout(timeout.timeoutId);
  }
}

export const timeoutManager = new TimeoutManager();