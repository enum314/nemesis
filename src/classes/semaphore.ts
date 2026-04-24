export class Semaphore {
  private permits: number;
  private queue: ((release: () => void) => void)[] = [];
  private owners = new Map<symbol, number>();

  constructor(maxPermits: number) {
    if (maxPermits <= 0) {
      throw new SemaphoreMaxPermitsError("Semaphore maxPermits must be > 0");
    }

    this.permits = maxPermits;
  }

  /**
   * Acquire a permit from the semaphore.
   * @param timeout optional timeout in ms before throwing an error
   * @param ownerToken optional token for tracking or reentrant usage
   * @returns release function
   */
  async acquire(timeout?: number, ownerToken?: symbol): Promise<() => void> {
    // Reentrant check: same owner can reacquire if they already hold at least one permit
    if (ownerToken && this.owners.has(ownerToken)) {
      const count = this.owners.get(ownerToken)! + 1;

      this.owners.set(ownerToken, count);

      return () => this.release(ownerToken);
    }

    // Wait if no permits available
    if (this.permits <= 0) {
      await new Promise<void>((resolve, reject) => {
        const start = Date.now();

        const waiter = (_: () => void) => {
          // Check timeout periodically
          if (timeout !== undefined && Date.now() - start >= timeout) {
            reject(
              new SemaphoreAcquireTimeoutError("Semaphore acquire timed out")
            );

            return;
          }
          resolve();
        };

        this.queue.push(waiter);

        if (timeout !== undefined) {
          const interval = setInterval(() => {
            if (Date.now() - start >= timeout) {
              const idx = this.queue.indexOf(waiter);

              if (idx >= 0) {
                this.queue.splice(idx, 1);
              }

              clearInterval(interval);

              reject(
                new SemaphoreAcquireTimeoutError("Semaphore acquire timed out")
              );
            }
          }, 10);
        }
      });
    }

    // Acquire permit
    this.permits--;

    if (ownerToken) {
      this.owners.set(ownerToken, 1);
    }

    // Return release function
    return () => this.release(ownerToken);
  }

  private release(ownerToken?: symbol) {
    // Reentrant handling
    if (ownerToken && this.owners.has(ownerToken)) {
      const count = this.owners.get(ownerToken)! - 1;

      if (count > 0) {
        this.owners.set(ownerToken, count);
        return;
      }

      this.owners.delete(ownerToken);
    }

    this.permits++;

    // Notify next waiter
    const next = this.queue.shift();

    if (next) {
      this.permits--;

      next(() => this.release());
    }
  }

  /** Current available permits */
  availablePermits(): number {
    return this.permits;
  }

  /** Whether the semaphore is fully occupied */
  isFull(): boolean {
    return this.permits <= 0;
  }
}

export class SemaphoreAcquireTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SemaphoreAcquireTimeoutError";
  }
}

export class SemaphoreMaxPermitsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SemaphoreMaxPermitsError";
  }
}
