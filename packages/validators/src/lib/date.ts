export function isDate(something: unknown): something is Date {
  return (
    typeof something === 'object' &&
    something !== null &&
    something instanceof Date
  );
}

export function isInvalidDate(date: Date): boolean {
  return date.toString() === 'Invalid Date';
}
