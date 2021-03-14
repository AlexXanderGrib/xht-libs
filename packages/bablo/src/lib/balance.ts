import { sub, sum } from '@xxhax/safe-math';
import {
  ICurrency,
  ICurrencyConstructor,
  ICurrencyPrimitive,
} from './currency';

export type Transaction = {
  amount: number;
  timestamp: number;
  description?: string;
};

export interface BalanceDTOWithoutTransactions {
  readonly type: 'pure';
  /** Total income */
  readonly income: number;
  /** Total spent */
  readonly spent: number;
  /** `income` - `spent` */
  readonly value: number;
}

export interface BalanceDTOWithTransactions {
  readonly type: 'with_transactions';
  /** Initial income */
  readonly income: number;
  /** Initial spent */
  readonly spent: number;
  /** All saved transactions */
  readonly transactions: ReadonlyArray<Transaction>;
  /**
   * `income + spent + transactions.reduce((a, b) => a + b, 0);`
   * */
  readonly value: number;
}

export type BalanceDTO =
  | BalanceDTOWithTransactions
  | BalanceDTOWithoutTransactions;

export interface ReadonlyBalance extends BalanceDTOWithTransactions {
  isAffordable(amount: number): boolean;
  onlyTransactions(): ReadonlyBalance;
  flat(): ReadonlyBalance;
  afterTransaction(amount: number): ReadonlyBalance;
  initial(): ReadonlyBalance;
  resolved(): ReadonlyBalance;
}

export interface FunctionalBalance extends ReadonlyBalance {
  map(fn: (value: number) => number): FunctionalBalance;
  asyncMap(fn: (value: number) => Promise<number>): Promise<FunctionalBalance>;
}

interface WithCurrency {
  readonly currency: ICurrencyConstructor;

  toCurrency(): ICurrency;
  toString(): string;
  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default'): string | number;
}

export interface IBalance extends FunctionalBalance {
  readonly transactions: ReadonlyArray<Transaction>;

  push(amount: number, description?: string): this;
  add(amount: number, description?: string): this;
  subtract(amount: number, description?: string): this;
  mergeWith(other: IBalance): this;

  onlyTransactions(): IBalance;
  flat(): IBalance;
  afterTransaction(amount: number): IBalance;
  initial(): IBalance;
  resolved(): IBalance;

  toJSON(): BalanceDTO;
  valueOf(): number;

  withCurrency(currency: ICurrencyConstructor): IBalanceWithCurrency;
}

export interface IBalanceWithCurrency extends IBalance, WithCurrency {}

export class Balance implements IBalance {
  public static get ZERO() {
    return new this();
  }

  public static from(value: number) {
    return new this(value);
  }

  public static fromDTO(dto: BalanceDTO) {
    if (dto.type === 'with_transactions') {
      const b = new this(dto.income, dto.spent);

      (dto.transactions || []).forEach((t) => b.transactions.push(t));
      return b;
    }

    return new this(dto.income, dto.spent);
  }

  public readonly transactions: Transaction[] = [];
  public readonly type = 'with_transactions';
  public readonly currency!: ICurrencyConstructor;

  protected readonly _income: number = 0;
  protected readonly _spent: number = 0;

  constructor(income = 0, spent = 0) {
    this._income = income;
    this._spent = spent;
  }
  public map(fn: (value: number) => number): FunctionalBalance {
    const currentValue = this.value;
    const newValue = fn(currentValue);

    const diff = -sub(currentValue, newValue);
    return this.afterTransaction(diff);
  }
  public async asyncMap(
    fn: (value: number) => Promise<number>
  ): Promise<FunctionalBalance> {
    const currentValue = this.value;
    const newValue = await fn(currentValue);

    const diff = -sub(currentValue, newValue);
    return this.afterTransaction(diff);
  }

  public mergeWith(other: IBalance) {
    if (other.transactions.length > 0) {
      other.transactions.forEach((t) => this.transactions.push(t));

      return this;
    }

    return this.push(other.value);
  }

  public push(amount: number, description?: string) {
    this.transactions.push({
      amount,
      timestamp: Date.now(),
      description,
    });

    return this;
  }

  public add(amount: number, description?: string) {
    return this.push(Math.abs(amount), description);
  }

  public subtract(amount: number, description?: string) {
    return this.push(-Math.abs(amount), description);
  }

  public resolved() {
    return new Balance().push(this.value).flat();
  }

  public initial() {
    return new Balance(this._income, this._spent);
  }

  protected get _transactionsIncome() {
    return this.transactions
      .filter((t) => t.amount >= 0)
      .reduce((a, t) => sum(a, t.amount), 0);
  }

  protected get _transactionsSpent() {
    return this.transactions
      .filter((t) => t.amount < 0)
      .reduce((a, t) => sub(a, t.amount), 0); // sub(0, -1) == sum(0, 1)
  }

  public onlyTransactions() {
    return new Balance(this._transactionsIncome, this._transactionsSpent);
  }

  public get income() {
    return sum(this._income, this._transactionsIncome);
  }
  public get spent() {
    return sum(this._spent, this._transactionsSpent);
  }

  public flat() {
    return new Balance(this.income, this.spent);
  }

  public get value() {
    return sub(this.income, this.spent);
  }

  public isAffordable(amount: number) {
    return sub(this.value, Math.abs(amount)) >= 0;
  }

  public afterTransaction(amount: number) {
    return this.flat().push(amount);
  }
  public toJSON(): BalanceDTO {
    return this.transactions.length > 0
      ? ({
          income: this._income,
          spent: this._spent,
          value: this.value,
          transactions: this.transactions,
          type: 'with_transactions',
        } as BalanceDTOWithTransactions)
      : ({
          income: this.income,
          spent: this.spent,
          value: this.value,
          type: 'pure',
        } as BalanceDTOWithoutTransactions);
  }

  public valueOf() {
    return this.value;
  }

  [Symbol.toPrimitive](): string | number {
    return this.valueOf();
  }

  get [Symbol.toStringTag]() {
    return 'Balance';
  }

  withCurrency(currency: ICurrencyConstructor) {
    return new BalanceWithCurrency(currency, this.income, this.spent);
  }
}

export class BalanceWithCurrency
  extends Balance
  implements IBalanceWithCurrency, ICurrencyPrimitive {
  constructor(
    public readonly currency: ICurrencyConstructor,
    income = 0,
    spent = 0
  ) {
    super(income, spent);
  }

  toCurrency() {
    return new this.currency(this.value);
  }

  toString() {
    return this.toCurrency().toString();
  }

  [Symbol.toPrimitive](
    hint: 'string' | 'number' | 'default' = 'default'
  ): string | number {
    if (hint === 'number') return this.valueOf();
    return this.toString();
  }
}
