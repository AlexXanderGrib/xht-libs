import { AnyKey } from './shared';

export function isObject(
  something: unknown
): something is Record<AnyKey, unknown> {
  return something && typeof something === 'object';
}
