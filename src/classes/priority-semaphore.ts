export class PrioritySemaphore {
  private permits: number;
  private queue: {
    priority: number;
    resolve: (release: () => void) => void;
    reject: (err: Error) => void;
  }[] = [];

  constructor(maxPermits: number) {
    if (maxPermits <= 0) {
      throw new PrioritySemaphoreMaxPermitsError(
        "PrioritySemaphore maxPermits must be > 0"
      );
    }

    this.permits = maxPermits;
  }

  async acquire(priority = 0, timeout?: number): Promise<() => void> {
    // Fast path: available permit
    if (this.permits > 0) {
      this.permits--;

      return () => this.release();
    }

    // Otherwise, wait
    return new Promise<() => void>((resolve, reject) => {
      const start = Date.now();

      const waiter = { priority, resolve, reject };

      this.queue.push(waiter);
      this.queue.sort((a, b) => b.priority - a.priority); // higher priority first

      if (timeout !== undefined) {
        const timer = setInterval(() => {
          if (Date.now() - start >= timeout) {
            const idx = this.queue.indexOf(waiter);

            if (idx >= 0) {
              this.queue.splice(idx, 1);
            }

            clearInterval(timer);

            reject(
              new PrioritySemaphoreAcquireTimeoutError(
                "PrioritySemaphore acquire timed out"
              )
            );
          }
        }, 10);
      }
    });
  }

  private release() {
    this.permits++;

    if (this.queue.length > 0) {
      // Pick highest-priority waiter
      const next = this.queue.shift();

      if (next) {
        this.permits--;

        next.resolve(() => this.release());
      }
    }
  }

  availablePermits() {
    return this.permits;
  }
}

export class PrioritySemaphoreAcquireTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrioritySemaphoreAcquireTimeoutError";
  }
}

export class PrioritySemaphoreMaxPermitsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrioritySemaphoreMaxPermitsError";
  }
}
