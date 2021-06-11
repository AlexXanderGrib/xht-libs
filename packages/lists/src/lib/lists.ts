/**
 * Splits an array to sub-arrays whit N size, or latest may be smaller
 *
 * @template {T}
 * @param {T[]} array Original array
 * @param {number} groupBy N
 *
 * @return {Array<T[]>}
 *
 * @example
 * chunk([1, 2, 3, 4, 5, 6, 7, 8], 3)
 * // => [[1, 2, 3], [4, 5, 6], [7, 8]]
 */
export function chunk<T>(array: T[], groupBy: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += groupBy) {
    result.push(array.slice(i, i + groupBy));
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Intl {
  export class ListFormat {
    constructor(locale: string, options: unknown);
    format(list: string[]): string;
  }
}

export const ListFormat = Intl.ListFormat;
