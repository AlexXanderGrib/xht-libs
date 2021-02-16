type Class = { new (...args: unknown[]): unknown };

export function isClass(something: unknown): something is Class {
  return (
    typeof something === 'function' && something.toString().startsWith('class ')
  );
}
