import { random } from '@xxhax/safe-math';
import { Balance } from './balance';

describe('Balance', () => {
  test('When adding amount, increases', () => {
    const b = new Balance();
    b.add(3.3);

    expect(b.value).toEqual(3.3);
  });

  test('When subtracting amount, decreases', () => {
    const b = new Balance(100);
    b.subtract(10.75);

    expect(b.value).toEqual(89.25);
  });

  test('Must have expected decimal(6,2) behavior', () => {
    const b = new Balance(0.1);
    b.add(0.2);

    expect(b.value).toEqual(0.3);
  });

  test("Must be able to test amount's affordability", () => {
    const b = new Balance(2, 0);

    expect(b.isAffordable(83.0)).toBeFalsy();
    expect(b.isAffordable(2)).toBeTruthy();
    expect(b.isAffordable(1.01)).toBeTruthy();
    expect(b.isAffordable(1.99)).toBeTruthy();
    expect(b.isAffordable(2.01)).toBeFalsy();
    expect(b.isAffordable(50)).toBeFalsy();
  });

  test('Must be able to flatten', () => {
    const b = new Balance();
    b.add(1000.07);

    expect(b.flat().onlyTransactions().value).toEqual(0);
  });

  test('Must be able to calculate state after transaction', () => {
    const b = new Balance();
    b.add(15);

    expect(b.afterTransaction(-3).value).toEqual(12);
    expect(b.afterTransaction(100).value).toEqual(115);
    expect(b.value).toEqual(15);
  });

  test('Must be able to get value before transactions', () => {
    const b = new Balance(15, 10);

    b.add(49);
    b.subtract(74);
    b.add(83);

    expect(b.initial().income).toEqual(15);
    expect(b.initial().spent).toEqual(10);
  });

  test('Can be negative', () => {
    const b = new Balance();

    b.add(30);
    b.subtract(150);

    expect(b.value).toEqual(-120);
  });

  test('Serialization', () => {
    const income = random(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 2);
    const spent = random(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 2);

    const data = JSON.stringify(new Balance(income, spent));

    const copy = Balance.fromDTO(JSON.parse(data));

    expect(copy.income).toEqual(income);
    expect(copy.spent).toEqual(spent);
  });

  test('mergeWith', () => {
    const a = new Balance(5, 10);
    const b = new Balance(15, 7);

    expect(a.value).toEqual(-5);
    expect(b.value).toEqual(8);

    a.mergeWith(b);

    expect(a.value).toEqual(3);
    expect(b.value).toEqual(8);
  });
});
