import { IEmitter, ISubscribeable, Subscription } from './shared';

export abstract class AbstractEventBus<T> implements ISubscribeable<T> {
  protected _subscriptions: Subscription<T>[] = [];

  public subscribe(callback: Subscription<T>): () => void {
    this._subscriptions.push(callback);

    return () => {
      this._subscriptions = this._subscriptions.filter((s) => s !== callback);
    };
  }

  protected _dispatch(data: T) {
    this._subscriptions.forEach((subscription) => subscription(data));
  }
}

export class EventBus<T>
  extends AbstractEventBus<T>
  implements ISubscribeable<T>, IEmitter<T> {
  protected _subscriptions: Subscription<T>[] = [];

  emit(data: T) {
    this._dispatch(data);
  }
}
