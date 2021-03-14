import { Currency } from './currency';
import { createFormatter } from './formatter';

describe(Currency.name, () => {
  test('USD', () => {
    const c = new Currency(10);

    expect(+c > 10).toBe(false);
    expect(c.toString()).toBe(createFormatter('USD', ['en-US'])(10));
  });

  test('RUB', () => {
    class RubleCurrency extends Currency {
      static sign = 'RUB';
      static locales = ['ru'];
    }

    const c = new RubleCurrency(30);

    expect(+c > 10).toBe(true);
    expect(Currency.isCurrencyConstructor(RubleCurrency)).toBe(true);
    expect(c.toString()).toBe(createFormatter('RUB', ['ru'])(30));
  });
});
