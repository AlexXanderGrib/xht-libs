import { check, gen } from './luhn';

describe('Luhn Algorithm Validator', () => {
  test('Checker', () => {
    expect(check('5479316644790819')).toBeTruthy();
    expect(check('4929206063858081')).toBeTruthy();
    expect(check('340007800771632')).toBeFalsy();
  });

  test('Generator', () => {
    const numbers = gen({ count: 100 });

    expect(numbers.every((n) => check(n))).toBeTruthy();
  });

  test('Generator w/ constraints', () => {
    const length = 19;
    const numbers = gen({
      count: 100,
      length,
      // Visa Sberbank
      start: '427666',
    });

    expect(numbers.every((n) => check(n) && n.length === length)).toBeTruthy();
  });
});
