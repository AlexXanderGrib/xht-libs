/**
 * Round function with precision
 *
 * @param {number} n number
 * @param {number} precision
 */

export function round(n: number, precision = 2) {
  const t = 10 ** precision;

  return Math.round(n * t) / t;
}

/**
 * Fraction safe "normalized" calculation
 *
 * @param {number} a
 * @param {number} b
 * @param {(a: number, b: number) => number} fn
 * @param {number} precision
 *
 * @returns {number}
 */
export function calculate(
  a: number,
  b: number,
  fn: (a: number, b: number) => number,
  precision = 2
): number {
  const t = 10 ** precision;

  return Math.round(fn(Math.round(a * t), Math.round(b * t))) / t;
}

/**
 * Fraction safe "+" sign
 *
 * @param {number} a
 * @param {number} b
 * @param {number} precision
 *
 * @returns {number}
 */
export function sum(a: number, b: number, precision = 2): number {
  return calculate(a, b, (x, y) => x + y, precision);
}

/**
 * Fraction safe "-" sign
 *
 * @param {number} a
 * @param {number} b
 * @param {number} precision
 *
 * @returns {number}
 */
export function sub(a: number, b: number, precision = 2): number {
  return calculate(a, b, (x, y) => x - y, precision);
}

/**
 *
 * @param {number} float
 * @returns {number}
 */
export function precision(float: number) {
  const str = float.toString();

  if (!str.includes('.')) return 0;

  return str.split('.')[1].length;
}

function randomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * **Generates random number between `min` & `max` with defined precision**
 *
 * 1) If `precision` < 1 generates `Integer`, else `Float`
 * 2) If `min` > `max`, `min` becomes `max`
 *
 * @param {number} min
 * @param {number} max
 * @param {number=} p Precision. By default, maximum precision of passed number.
 *
 * @example
 *
 *
 * random(1.678456, 4.02) // => 3.765689
 * //      ^
 * // Here is max precision (6), it is applies to result
 */
export function random(
  min: number,
  max: number,
  p: number = Math.max(precision(min), precision(max))
) {
  if (min > max) {
    [min, max] = [max, min];
  }

  if (p <= 0) return randomInt(min, max);

  return calculate(min, max, (a, b) => randomInt(a, b), p);
}

const SafeMath = {
  round,
  random,
  precision,
  sub,
  sum,
  calculate,
};

export default SafeMath;
