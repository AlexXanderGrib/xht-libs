import { hasProp, isClass } from '@xxhax/validators';
import { createFormatter } from './formatter';

export interface ICurrencyPrimitive {
  toString(): string;
  valueOf(): number;
  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string | number;
}

export interface ICurrency extends ICurrencyPrimitive {
  readonly sign: string;
  readonly amount: number;
  readonly locales: string[];
}

export interface ICurrencyConstructor {
  readonly locales?: string[];
  readonly sign: string;
  new (value: number): ICurrency;
}

/**
 * @example
 * class RubleCurrency extends Currency {
 *    // Possible to use this codes instead of actual signs
 *    static sign = "RUB"
 *    static locales = ["ru"]
 * }
 *
 */
export class Currency implements ICurrency {
  public static typeCheck(c: ICurrencyConstructor) {
    void c;
  }

  public static isCurrencyConstructor(
    something
  ): something is ICurrencyConstructor {
    if (!isClass(something)) return false;
    if (!(hasProp(something, 'sign') && typeof something.sign === 'string'))
      return false;

    const cur = new something(10);

    if (!(hasProp(cur, 'sign') && typeof cur.sign === 'string')) return false;
    if (!(hasProp(cur, 'amount') && typeof cur.amount === 'number'))
      return false;

    return true;
  }

  public static readonly sign: string = 'USD';
  public static readonly locales = ['en-US'];

  public get sign() {
    const ctor = this.constructor as ICurrencyConstructor;

    return ctor.sign || 'USD';
  }

  public get locales() {
    const ctor = this.constructor as ICurrencyConstructor;

    return ctor.locales || ['en-US'];
  }

  private _format!: (n: number) => string;

  constructor(public readonly amount: number) {}

  public toString() {
    if (!this._format) this._format = createFormatter(this.sign, this.locales);

    return this._format(this.amount);
  }

  public valueOf() {
    return this.amount;
  }
  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default' = 'default') {
    switch (hint) {
      case 'number':
        return this.valueOf();
      default:
        return this.toString();
    }
  }
}
