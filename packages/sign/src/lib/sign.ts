import {
  BinaryLike,
  createHmac,
  createSign,
  createVerify,
  KeyLike,
} from 'crypto';

type TypedArray =
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array;

type Data = string | TypedArray | DataView;
type Signature = TypedArray;

type Converter<F, T> = (data: F) => T;
type Serializer<F, T> = {
  serialize: Converter<F, T>;
  deserialize: Converter<T, F>;
};

export interface Authority<D = Data, S = Signature> {
  sign(data: D): S;
  check(data: D, sign: S): boolean;
}

export interface AsyncAuthority<D = Data, S = Signature> {
  sign(data: D): Promise<S>;
  check(data: D, sign: S): Promise<boolean>;
}

type SymmetricKey = BinaryLike;
export class HmacAuthority implements Authority {
  static readonly DefaultAlgorithm = 'SHA256';

  static sign(
    data: Data,
    key: SymmetricKey,
    algorithm = this.DefaultAlgorithm
  ) {
    return createHmac(algorithm, key).update(data).digest();
  }

  static check(
    data: Data,
    sign: Signature,
    key: SymmetricKey,
    algorithm = this.DefaultAlgorithm
  ) {
    return this.sign(data, key, algorithm).join() === sign.join();
  }

  constructor(
    public readonly key: SymmetricKey,
    public readonly algorithm = HmacAuthority.DefaultAlgorithm
  ) {}

  sign(data: Data, key = this.key) {
    return HmacAuthority.sign(data, key, this.algorithm);
  }

  check(data: Data, sign: Signature, key = this.key) {
    return HmacAuthority.check(data, sign, key, this.algorithm);
  }
}

type AsymmetricKey = KeyLike;
export class AsymmetricAuthority implements Authority {
  static readonly DefaultAlgorithm = 'SHA256';

  static sign(
    data: Data,
    privateKey: AsymmetricKey,
    algorithm = this.DefaultAlgorithm
  ) {
    return createSign(algorithm).update(data).sign(privateKey);
  }

  static check(
    data: Data,
    sign: Signature,
    publicKey: AsymmetricKey,
    algorithm = this.DefaultAlgorithm
  ) {
    return createVerify(algorithm).update(data).verify(publicKey, sign);
  }

  constructor(
    public readonly publicKey: AsymmetricKey,
    public readonly privateKey: AsymmetricKey,
    public readonly algorithm = AsymmetricAuthority.DefaultAlgorithm
  ) {}

  sign(data: Data) {
    return AsymmetricAuthority.sign(data, this.privateKey, this.algorithm);
  }

  check(data: Data, sign: Signature) {
    return AsymmetricAuthority.check(
      data,
      sign,
      this.publicKey,
      this.algorithm
    );
  }
}

type FacadeSignatureSerializer = Serializer<Signature, string>;

// Default Signature Serializer
const DSS: FacadeSignatureSerializer = {
  serialize(data) {
    return Buffer.from(data).toString('base64');
  },
  deserialize(string) {
    return Buffer.from(string, 'base64');
  },
};

export class AuthorityFacade<T> implements Authority<T, string> {
  constructor(
    private readonly authority: Authority,
    private readonly serializeData: Converter<T, Data> = JSON.stringify,
    private readonly signatureSerializer: FacadeSignatureSerializer = DSS
  ) {}

  sign(data: T): string {
    const serialized = this.serializeData(data);
    const signature = this.authority.sign(serialized);

    return this.signatureSerializer.serialize(signature);
  }

  check(data: T, sign: string): boolean {
    const serialized = this.serializeData(data);
    const signature = this.signatureSerializer.deserialize(sign);

    return this.authority.check(serialized, signature);
  }
}

export class AsyncAuthorityFacade<T> implements AsyncAuthority<T, string> {
  constructor(
    private readonly authority: AsyncAuthority,
    private readonly serializeData: Converter<T, Data> = JSON.stringify,
    private readonly signatureSerializer: FacadeSignatureSerializer = DSS
  ) {}

  async sign(data: T) {
    const serialized = this.serializeData(data);
    const signature = await this.authority.sign(serialized);

    return this.signatureSerializer.serialize(signature);
  }

  check(data: T, sign: string) {
    const serialized = this.serializeData(data);
    const signature = this.signatureSerializer.deserialize(sign);

    return this.authority.check(serialized, signature);
  }
}
