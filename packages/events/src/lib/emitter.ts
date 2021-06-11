/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subscription } from './shared';

export interface IEventEmitter<T extends Record<any, any> = any> {
  on<K extends keyof T>(event: K, listener: Subscription<T[K]>): this;

  off<K extends keyof T>(event: K, listener: Subscription<T[K]>): this;

  once<K extends keyof T>(event: K, listener: Subscription<T[K]>): this;

  eventNames(): Array<keyof T>;
  listeners<K extends keyof T>(event: K): Array<Subscription<T[K]>>;

  subscribe<K extends keyof T>(
    event: K,
    listener: Subscription<T[K]>
  ): () => void;

  waitFor<K extends keyof T>(event: K): Promise<T[K]>;

  emit<K extends keyof T>(event: T, data: T[K]): void;
}

export class EventEmitter<T extends Record<any, any> = any>
  implements IEventEmitter<T> {
  protected readonly _events: {
    [key in keyof T]?: Subscription<T[key]>[];
  } = {};

  protected _updateListeners<K extends keyof T>(
    event: K,
    update: (subscriptions: Subscription<T[K]>[]) => Subscription<T[K]>[]
  ) {
    const array = this.listeners(event);

    this._events[event] = update(array);
    return this;
  }

  on<K extends keyof T>(event: K, listener: Subscription<T[K]>): this {
    return this._updateListeners(event, (s) => [...s, listener]);
  }
  off<K extends keyof T>(event: K, listener: Subscription<T[K]>): this {
    return this._updateListeners(event, (s) => {
      const index = s.indexOf(listener);
      if (index === -1) return s;

      return s.filter((_, idx) => idx === index);
    });
  }
  once<K extends keyof T>(event: K, listener: Subscription<T[K]>): this {
    this.on(event, listener);

    const cb = () => {
      this.off(event, cb);
      this.off(event, listener);
    };

    this.on(event, cb);
    return this;
  }
  eventNames(): (keyof T)[] {
    return Object.keys(this._events).filter((k) => this._events[k].length > 0);
  }
  listeners<K extends keyof T>(event: K): Subscription<T[K]>[] {
    if (this._events[event]) return this._events[event];

    return (this._events[event] = []);
  }
  subscribe<K extends keyof T>(
    event: K,
    listener: Subscription<T[K]>
  ): () => void {
    this.on(event, listener);

    return () => this.off(event, listener);
  }
  waitFor<K extends keyof T>(event: K): Promise<T[K]> {
    return new Promise((resolve) => this.once(event, resolve));
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners(event).forEach((fn) => fn(data));
  }
}
