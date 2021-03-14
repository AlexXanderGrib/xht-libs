import { random, sum } from '@xxhax/safe-math';
import { Balance } from './balance';
import { Currency } from './currency';

describe('Balance', () => {
  test('When adding amount, increases', () => {
    const b = new Balance();
    b.add(3.3);

    expect(b.value).toBe(3.3);
  });

  test('When subtracting amount, decreases', () => {
    const b = new Balance(100);
    b.subtract(10.75);

    expect(b.value).toBe(89.25);
  });

  test('Must have expected decimal(6,2) behavior', () => {
    const b = new Balance(0.1);
    b.add(0.2);

    expect(b.value).toBe(0.3);
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

    expect(b.flat().onlyTransactions().value).toBe(0);
  });

  test('Must be able to calculate state after transaction', () => {
    const b = new Balance();
    b.add(15);

    expect(b.afterTransaction(-3).value).toBe(12);
    expect(b.afterTransaction(100).value).toBe(115);
    expect(b.value).toBe(15);
  });

  test('Must be able to get value before transactions', () => {
    const b = new Balance(15, 10);

    b.add(49);
    b.subtract(74);
    b.add(83);

    expect(b.initial().income).toBe(15);
    expect(b.initial().spent).toBe(10);
  });

  test('Can be negative', () => {
    const b = new Balance();

    b.add(30);
    b.subtract(150);

    expect(b.value).toBe(-120);
  });

  test('Serialization', () => {
    const MAX_INT_32 = 2 ** 31 - 1;

    const income = random(0, MAX_INT_32, 2);
    const spent = random(0, MAX_INT_32, 2);

    const initialIncome = random(0, MAX_INT_32, 2);
    const initialSpent = random(0, MAX_INT_32, 2);

    const balance = new Balance(initialIncome, initialSpent);

    balance.add(income);
    balance.subtract(spent);

    const data = JSON.stringify(balance);
    const copy = Balance.fromDTO(JSON.parse(data));

    expect(copy.income).toBe(sum(income, initialIncome));
    expect(copy.spent).toBe(sum(spent, initialSpent));
    expect(copy.initial().income).toBe(initialIncome);
    expect(copy.initial().spent).toBe(initialSpent);
    expect(copy.transactions.length).toBe(2);
  });

  test('mergeWith', () => {
    const a = new Balance(5, 10);
    const b = new Balance(15, 7);

    expect(a.value).toBe(-5);
    expect(b.value).toBe(8);

    a.mergeWith(b);

    expect(a.value).toBe(3);
    expect(b.value).toBe(8);
  });

  test('map', () => {
    const a = Balance.ZERO;
    const n = random(-10, 40);
    const b = a.map(() => n);

    expect(a.value).toBe(0);
    expect(b.value).toBe(n);
  });

  test('withCurrency', () => {
    const b = new Balance(10).withCurrency(Currency);

    expect(b.toString()).toBe(new Currency(10).toString());
  });
});
