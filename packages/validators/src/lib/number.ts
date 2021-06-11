const nt = Symbol('NUMBER_TYPE');

type Int = number & { [nt]?: 'int' };
type Bigint = bigint & { [nt]?: 'bigint' };
type Float = number & { [nt]?: 'float' };
type Num = Int | Float;
type AnyNum = Num | Bigint;
type AnyInt = Int | Bigint;
export function isNumber(n: unknown): n is Num {
  return typeof n === 'number' && !Number.isNaN(n);
}

export function isNumberOrBigInt(n: unknown): n is AnyNum {
  return isNumber(n) || isBigInt(n);
}

export function isFiniteNumber(n: unknown): n is Int {
  return isNumber(n) && Number.isFinite(n);
}

export function isInteger(n: unknown): n is AnyInt {
  if (Number.isNaN(n)) {
    return false;
  }

  if (isBigInt(n)) return true;

  return isFiniteNumber(n) && Number.isInteger(n);
}

export function isBigInt(n: unknown): n is Bigint {
  return typeof n === 'bigint';
}

export function isFloat(n: unknown): n is Float {
  return isFiniteNumber(n) && !Number.isInteger(n);
}

export enum IntType {
  Int8 = 'INT_8',
  Int16 = 'INT_16',
  Int32 = 'INT_32',
  uInt8 = 'UINT_8',
  uInt16 = 'UINT_16',
  uInt32 = 'UINT_32',
  BigInt = 'BIGINT',
  UnsafeInt = 'UNSAFE',
}

export enum FloatType {
  Float32 = 'FLOAT_32',
  Float64 = 'FLOAT_64',
}

export function floatTypes(float: Float): FloatType[] {
  const array = new Float32Array(1);
  const view = new DataView(array.buffer);

  view.setFloat32(0, float);

  return view.getFloat32(0) === float
    ? [FloatType.Float32, FloatType.Float64]
    : [FloatType.Float64];
}

export function intTypes(int: Int | Bigint): IntType[] {
  if (isBigInt(int)) return [IntType.BigInt];

  const mapping: [number, IntType, IntType][] = [
    [0x7f, IntType.Int8, IntType.uInt8],
    [0x7fff, IntType.Int16, IntType.uInt16],
    [0x7fffffff, IntType.Int32, IntType.uInt32],
  ];

  const types: IntType[] = [];

  for (const [limit, Type, uType] of mapping) {
    const inverted = ~limit;
    const unsigned = limit - inverted;

    if (int >= 0 && int <= unsigned) types.push(uType);

    if (int >= inverted && int <= limit) types.push(Type);
  }

  if (types.length === 0) types.push(IntType.UnsafeInt);

  return types;
}

export function numberTypes(number: number | bigint): (IntType | FloatType)[] {
  if (isFloat(number)) {
    return floatTypes(number);
  }

  return intTypes(number);
}

numberTypes(0x7fff); //?
