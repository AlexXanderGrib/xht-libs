import { sub, sum } from '@xxhax/safe-math';

export type Transaction = {
  amount: number;
  timestamp: number;
  description?: string;
};

export interface BalanceDTO {
  readonly income: number;
  readonly spent: number;
  readonly value: number;
  readonly transactions?: ReadonlyArray<Transaction>;
}

export interface ReadonlyBalance extends BalanceDTO {
  isAffordable(amount: number): boolean;
  onlyTransactions(): ReadonlyBalance;
  flat(): ReadonlyBalance;
  afterTransaction(amount: number): ReadonlyBalance;
  initial(): ReadonlyBalance;
  resolved(): ReadonlyBalance;
}

export interface IBalance extends ReadonlyBalance {
  readonly transactions: Transaction[];

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
}

export class Balance implements IBalance {
  public static fromDTO(dto: BalanceDTO) {
    if (dto.transactions?.length > 0) {
      const b = new this();

      dto.transactions.forEach((t) => b.transactions.push(t));
    }

    return new this(dto.income, dto.spent);
  }

  public readonly transactions: Transaction[] = [];

  private readonly _income: number = 0;
  private readonly _spent: number = 0;

  constructor(income = 0, spent = 0) {
    this._income = income;
    this._spent = spent;
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

  private get _transactionsIncome() {
    return this.transactions
      .filter((t) => t.amount >= 0)
      .reduce((a, t) => sum(a, t.amount), 0);
  }

  private get _transactionsSpent() {
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
    return {
      income: this.income,
      spent: this.spent,
      value: this.value,
      transactions:
        this.transactions.length > 0 ? this.transactions : undefined,
    };
  }
}
