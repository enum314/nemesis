export class Mutex {
  private locked = false;
  private queue: ((release: () => void) => void)[] = [];
  private owner?: symbol;

  /**
   * Acquires the lock.
   * @param timeout optional timeout in ms before throwing an error
   * @param ownerToken optional unique token for reentrant locking
   * @returns release function
   */
  async lock(timeout?: number, ownerToken?: symbol): Promise<() => void> {
    // Reentrant check — same owner can reacquire without waiting
    if (this.locked && ownerToken && this.owner === ownerToken) {
      let reentrancyCount =
        (Reflect.get(this, "__reentrancy__") as number) || 1;

      Reflect.set(this, "__reentrancy__", reentrancyCount + 1);

      return () => this.unlock(ownerToken);
    }

    // If already locked, wait
    if (this.locked) {
      await new Promise<void>((resolve, reject) => {
        const start = Date.now();

        const waiter = (_: () => void) => {
          // Check timeout periodically
          if (timeout !== undefined && Date.now() - start >= timeout) {
            reject(new Error("Mutex lock timed out"));

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

              reject(new Error("Mutex lock timed out"));
            }
          }, 10);
        }
      });
    }

    // Lock acquired
    this.locked = true;
    this.owner = ownerToken;

    Reflect.set(this, "__reentrancy__", 1);

    // Return release fn
    return () => this.unlock(ownerToken);
  }

  private unlock(ownerToken?: symbol) {
    // Handle reentrancy
    if (ownerToken && this.owner === ownerToken) {
      let reentrancyCount =
        (Reflect.get(this, "__reentrancy__") as number) || 1;

      if (reentrancyCount > 1) {
        Reflect.set(this, "__reentrancy__", reentrancyCount - 1);

        return; // still owned
      }
    }

    this.locked = false;
    this.owner = undefined;

    const next = this.queue.shift();

    if (next) {
      this.locked = true;

      next(() => this.unlock());
    }
  }

  /** Check if currently locked */
  isLocked(): boolean {
    return this.locked;
  }
}
