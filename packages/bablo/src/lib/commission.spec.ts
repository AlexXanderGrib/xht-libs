import { createCommissionCalculator } from './commission';

describe('Commission Calculator', () => {
  it('applies only needed rules', () => {
    const calculate = createCommissionCalculator(
      {
        max: 30,
        fixed: 5,
      },
      {
        min: 30,
        fixed: 1,
      }
    );

    expect(calculate(23)).toBe(5);
    expect(calculate(30)).toBe(6); // 5 + 1
    expect(calculate(31)).toBe(1);
  });

  it('sums takes percent from orig', () => {
    const calculate = createCommissionCalculator({
      fixed: 10,
      percent: 15,
    });

    expect(calculate(50)).toBe(17.5);
  });
});
