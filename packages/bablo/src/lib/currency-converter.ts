import { round } from '@xxhax/safe-math';
import { BalanceWithCurrency } from './balance';
import { ICurrencyConstructor } from './currency';

export class ExchangeRate {
  static readonly NO_EXCHANGE = 0;

  /**
   *
   * @param {number} buyPrice - buy rate
   * @param {number} sellPrice - sell rate, by defaults equals buy rate
   *
   * buy rate is often higher than sellRate
   *
   * ### To prevent exchange in certain direction set `buy` or `sell` property(-ies) to `Exchange.NO_EXCHANGE`
   */
  constructor(public buyPrice: number, public sellPrice = buyPrice) {}

  get allowedSelling() {
    return this.sellPrice !== ExchangeRate.NO_EXCHANGE;
  }

  get allowedBuying() {
    return this.buyPrice !== ExchangeRate.NO_EXCHANGE;
  }

  buy(amountInBaseCurrency: number) {
    return round(amountInBaseCurrency / this.buyPrice, 2);
  }

  sell(amountInCurrentCurrency: number) {
    return round(amountInCurrentCurrency * this.sellPrice, 2);
  }
}

export class CurrencyConverter {
  constructor(
    protected readonly _baseCurrency: ICurrencyConstructor,
    protected readonly _map: Record<
      ICurrencyConstructor['sign'],
      ExchangeRate
    > = {}
  ) {}

  setRate(sign: ICurrencyConstructor['sign'], rate: ExchangeRate) {
    this._map[sign] = rate;
  }

  resetRate(sign: ICurrencyConstructor['sign']) {
    delete this._map[sign];
  }

  get supportedCurrencies(): ICurrencyConstructor['sign'][] {
    return [this._baseCurrency.sign, ...Object.keys(this._map)];
  }

  convert(
    from: BalanceWithCurrency,
    to: ICurrencyConstructor
  ): BalanceWithCurrency {
    const baseRate =
      from.currency.sign === this._baseCurrency.sign
        ? new ExchangeRate(1)
        : this._map[from.currency.sign];
    if (!baseRate) {
      throw new Error(
        `Currency "${from.currency.sign}" is not registered in this converter`
      );
    }

    if (!baseRate.allowedSelling) {
      throw new Error(
        `Selling of currency "${from.currency.sign}" is disallowed`
      );
    }

    const resultingRate =
      to.sign === this._baseCurrency.sign
        ? new ExchangeRate(1)
        : this._map[to.sign];
    if (!resultingRate) {
      throw new Error(
        `Currency "${to.sign}" is not registered in this converter`
      );
    }

    if (!resultingRate.allowedBuying) {
      throw new Error(`Buying of currency "${to.sign}" is disallowed`);
    }

    const amountInBaseCurrency = baseRate.sell(from.value);
    const amountInResultingCurrency = resultingRate.buy(amountInBaseCurrency);

    return new BalanceWithCurrency(to, amountInResultingCurrency);
  }
}
