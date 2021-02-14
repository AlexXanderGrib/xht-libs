import { createFormatter } from './formatter';

describe('Money Formatter', () => {
  test('Default Formatter', () => {
    const fmt = createFormatter();

    expect(fmt(10000.56)).toBe('$10,000.56');
  });

  test('Russian Formatter', () => {
    const fmt = createFormatter('RUB', ['ru']);
    const nobr = String.fromCharCode(160);

    expect(fmt(10000.75)).toEqual(`10${nobr}000,75${nobr}₽`);
  });

  test('Custom Formatter', () => {
    const fmt = createFormatter('BUCKS');

    expect(fmt(300)).toBe('300 BUCKS');
  });
});
