import { isObject } from './object';
import { SafeAny } from './shared';

export function isPromise<T = SafeAny>(
  something: unknown
): something is Promise<T> {
  return isObject(something) && something instanceof Promise;
}
