import { BalanceWithCurrency } from './balance';
import { Currency } from './currency';
import { CurrencyConverter, ExchangeRate } from './currency-converter';

class RubleCurrency extends Currency {
  static sign = 'RUB';
  static locales = ['ru'];
}

class DollarCurrency extends Currency {
  static sign = 'USD';
  static locales = ['en-US'];
}

class EuroCurrency extends Currency {
  static sign = 'EUR';
  static locales = ['de'];
}

describe(CurrencyConverter.name, () => {
  const converter = new CurrencyConverter(RubleCurrency, {
    [DollarCurrency.sign]: new ExchangeRate(74.85, 71.79),
    [EuroCurrency.sign]: new ExchangeRate(87.41, ExchangeRate.NO_EXCHANGE),
  });

  test('Can buy rubles for dollars', () => {
    const balance = new BalanceWithCurrency(DollarCurrency, 300);
    const rubles = converter.convert(balance, RubleCurrency);

    expect(rubles.value).toBe(21537);
  });

  test('Can buy dollars for rubles', () => {
    const balance = new BalanceWithCurrency(RubleCurrency, 300);
    const bucks = converter.convert(balance, DollarCurrency);

    expect(bucks.value).toBe(4.01);
  });

  test('Can buy euros for dollars thru rubles', () => {
    const balance = new BalanceWithCurrency(DollarCurrency, 300);
    const euros = converter.convert(balance, EuroCurrency);

    expect(euros.value).toBe(246.39);
  });

  test('Can not sell euros because its disables buy rate', () => {
    const balance = new BalanceWithCurrency(EuroCurrency, 300);
    expect(() => converter.convert(balance, RubleCurrency)).toThrowError(
      'Selling of currency "EUR" is disallowed'
    );
  });
});
