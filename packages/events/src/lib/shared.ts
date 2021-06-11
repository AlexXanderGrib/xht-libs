export type Subscription<T> = (data: T) => void;

export interface ISubscribeable<T> {
  subscribe(subscriptions: Subscription<T>): () => void;
}

export interface IEmitter<T> {
  emit(data: T): void;
}
