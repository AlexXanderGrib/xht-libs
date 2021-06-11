export function normalize(input?: string): string {
  if (!input) input = '';

  return input
    .split('')
    .filter((char) => char.charCodeAt(0) <= 1416)
    .join('')
    .toLowerCase()
    .replace(/ +/g, ' ')
    .trim();
}

export function createIDGenerator(
  dictionary:
    | string
    | string[] = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopasdfghjklzxcvbnm_-',
  defaultLength = 32
) {
  const charset = Array.isArray(dictionary) ? dictionary : dictionary.split('');

  if(charset.length === 0) throw new Error('ID character dictionary can not be empty');

  return (length = defaultLength) => {
    let result = '';

    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }

    return result.slice(0, length);
  };
}

/**
 * URL friendly ID generator, by default ID length id 32 chars
 */
export const id = createIDGenerator();

export function templateReplace(
  template: string,
  replacements: Record<string, unknown>
) {
  Object.entries(replacements).forEach(([key, value]) => {
    while (template.includes(`{{${key}}}`)) {
      template = template.replace(`{{${key}}}`, String(value));
    }
  });

  return template;
}

/**
 * @param {string} orig Original string
 * @param {string|string[]} dict Dictionary of allowed letters
 *
 * @return {string} String containing only letters in dict, keeping the order
 *
 * @example
 * filterString('8 (800) 555 35-35', '1234567890')
 * // => 88005553535
 */
export function filterString(
  orig: string,
  dict: string | string[] | RegExp
): string {
  return orig
    .split('')
    .filter((letter) =>
      dict instanceof RegExp ? dict.test(letter) : dict.includes(letter)
    )
    .join('');
}
