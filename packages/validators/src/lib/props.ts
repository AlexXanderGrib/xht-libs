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

export function hasShape<Shape extends Record<AnyKey, unknown>>(
  something: unknown,
  shape: Shape
): something is { [key in keyof Shape]: unknown } {
  for (const prop in shape) {
    if (!hasProp(something, prop)) return false;
  }

  return true;
}
