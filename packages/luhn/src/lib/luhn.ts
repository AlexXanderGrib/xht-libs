/**
 * Checks card number by Luhn's algorithm
 *
 * @param {string} digits - String, containing only digits
 * @returns {boolean} Result of check
 */
export function check(digits: string) {
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    let currentDigit = parseInt(digits[i], 10);

    if ((digits.length - i) % 2 === 0) {
      currentDigit = currentDigit * 2;

      if (currentDigit > 9) {
        currentDigit = currentDigit - 9;
      }
    }

    sum += currentDigit;
  }

  return sum % 10 === 0;
}

function randomDigitsString(length: number) {
  let string = '';

  for (let i = 0; i < length; i++) {
    string += Math.floor(Math.random() * 10);
  }

  return string;
}

export type GenerationOptions = {
  /** Digits to start with */
  start?: string;
  /**
   * Total length
   * @default 16
   */
  length?: number;

  /**
   * Amount of generator output
   * @default 1
   */
  count?: number;
};

/**
 *
 *
 * @param {GenerationOptions?} options
 * @returns {string[]} Array of digit strings. By default returns only 1 string in array
 */
export function gen(options: GenerationOptions = {}): string[] {
  const start = options.start ?? '';
  const length = options.length ?? 16;
  const outputSize = options.count ?? 1;
  const spaceLength = length - start.length;
  const results: string[] = [];

  while (results.length < outputSize) {
    const filler = randomDigitsString(spaceLength);
    const number = start + filler;

    if (check(number)) results.push(number);
  }

  return results;
}

const luhn = { gen, check };
export default luhn;
