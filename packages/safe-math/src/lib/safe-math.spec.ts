import { precision, random, sub, sum } from './safe-math';

describe('Safe Math', () => {
  test('Addition', () => expect(sum(0.1, 0.2)).toBe(0.3));
  test('Subtraction', () => expect(sub(0.3, 0.2)).toBe(0.1));

  describe('Random', () => {
    function crazyRepeat(fn: () => void) {
      for (let i = 0; i < 1000; i++) fn();
    }

    test('Int', () => {
      const min = 10,
        max = 20;

      crazyRepeat(() => {
        const rand = random(min, max);

        expect(rand).toBeGreaterThanOrEqual(min);
        expect(rand).toBeLessThanOrEqual(max);
      });
    });

    test('Float with unknown precision', () => {
      const min = 1.080706,
        max = 3.2172167;

      crazyRepeat(() => {
        const rand = random(min, max);

        expect(rand).toBeGreaterThanOrEqual(min);
        expect(rand).toBeLessThanOrEqual(max);
        expect(precision(rand)).toBeLessThanOrEqual(7);
      });
    });

    test('Float with defined precision', () => {
      const min = 1.080706,
        max = 3.2172167;

      crazyRepeat(() => {
        const rand = random(min, max, 2);

        expect(rand).toBeGreaterThanOrEqual(1.08);
        expect(rand).toBeLessThanOrEqual(3.22);
        expect(precision(rand)).toBeLessThanOrEqual(2);
      });
    });
  });
});
