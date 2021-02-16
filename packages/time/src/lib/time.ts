export function sleep(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function measure<T>(name: string, fn: () => T): T {
  console.time(name);
  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => console.timeEnd(name)) as typeof result;
  }

  console.timeEnd(name);
  return result;
}
