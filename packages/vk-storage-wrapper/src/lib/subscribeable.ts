type Subscription<T> = (data: T) => void;

export class Subscribeable<T> {
  private _subscriptions: Subscription<T>[] = [];

  subscribe(fn: Subscription<T>) {
    this._subscriptions.push(fn);

    return () => {
      this._subscriptions = this._subscriptions.filter((sub) => sub !== fn);
    };
  }

  emit(data: T) {
    this._subscriptions.forEach((fn) => fn(data));
  }
}
