import { AnyKey } from './shared';

export function isObject(something): something is Record<AnyKey, unknown> {
  return something && typeof something === 'object';
}
