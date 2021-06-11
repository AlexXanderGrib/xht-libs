/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyDTO = Record<string, any>;

export type PaymentStatus =
  | 'created'
  | 'waiting_confirmation'
  | 'processing'
  | 'succeeded'
  | 'failed';

export interface PaymentCredentials extends AnyDTO {
  system: string;
  account: string;
}

export type CreditCard = {
  number: string;
  expiry: [month: number, year: number];
  cvc: number;
  holder?: string;
};

export interface IPaymentDTO<T extends AnyDTO = AnyDTO> {
  readonly id: string;

  from: PaymentCredentials;
  to: PaymentCredentials;

  status: PaymentStatus;
  amount: number;

  payload: T;
}

export interface IPaymentConstructor<P extends IPayment = IPayment> {
  create(
    amount: number,
    from: PaymentCredentials,
    to: PaymentCredentials,
    payload: P extends IPayment<infer T> ? T : AnyDTO
  ): Promise<P>;
}

export class PaymentBuilder<T extends IPaymentConstructor> {
  private _from: PaymentCredentials;
  private _to: PaymentCredentials;
  private _amount: number;
  private _payload: AnyDTO;

  static build<T extends IPaymentConstructor>(className: T): PaymentBuilder<T> {
    return new this(className);
  }

  constructor(private readonly className: T) {}

  of(amount: number) {
    this._amount = amount;
    return this;
  }

  from(credentials: PaymentCredentials) {
    this._from = credentials;
    return this;
  }

  to(credentials: PaymentCredentials) {
    this._to = credentials;
    return this;
  }

  with(data: T extends IPaymentConstructor<infer X> ? X : AnyDTO) {
    this._payload = data;
    return this;
  }

  create(): T extends IPaymentConstructor<infer X> ? Promise<X> : never {
    return this.className.create(
      this._amount,
      this._from,
      this._to,
      this._payload
    ) as any;
  }
}

export interface IPayment<T extends AnyDTO = AnyDTO, C extends AnyDTO = AnyDTO>
  extends IPaymentDTO<T> {
  perform(): Promise<void>;
  confirm(data: C): Promise<void>;
  cancel(): Promise<void>;
}
