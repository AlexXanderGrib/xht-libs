import { AbstractEventBus } from '@xxhax/events';

export class Queue<T> extends AbstractEventBus<T> implements AsyncIterator<T> {
  protected readonly _store: T[] = [];

  push(...items: T[]) {
    for (const item of items) {
      this._store.push(item);
      this._dispatch(item);
    }

    return this;
  }

  async next(): Promise<IteratorResult<T>> {
    const value = this._store.shift();

    if (value !== undefined) return { value };

    return new Promise((resolve) => {
      const unsubscribe = this.subscribe(() => {
        const value = this._store.shift();

        if (value !== undefined) {
          resolve({ value });
          unsubscribe && unsubscribe();
        }
      });
    });
  }

  [Symbol.asyncIterator]() {
    return this;
  }
}

export class StoppableQueue<T> extends Queue<T> {
  protected _stopped = false;
  public stop: () => void;

  public readonly whenStopped: Promise<void> = new Promise((resolve) => {
    this.stop = () => {
      resolve();
      this._stopped = true;
    };
  });

  async next(): Promise<IteratorResult<T>> {
    if (this._stopped) return { value: undefined, done: true };

    return super.next();
  }
}
