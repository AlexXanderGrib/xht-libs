export type Callable = (...args: unknown[]) => unknown;

export function isCallable(something: unknown): something is Callable {
  return (
    typeof something === 'function' &&
    !something.toString().startsWith('class ')
  );
}
