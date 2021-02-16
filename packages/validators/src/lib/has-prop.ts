import { AnyKey, SafeAny } from './shared';

export function hasProp<K extends AnyKey>(
  something: unknown,
  prop: K
): something is Record<K, unknown> {
  try {
    return !!(something as SafeAny)[prop];
  } catch {
    return false;
  }
}
