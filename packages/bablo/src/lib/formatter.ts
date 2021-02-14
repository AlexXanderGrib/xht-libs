export function createFormatter(currency = 'USD', locales: string[] = ['en']) {
  try {
    const formatter = new Intl.NumberFormat(locales, {
      currency,
      style: 'currency',
    });

    return (amount: number) => formatter.format(amount);
  } catch {
    const formatter = new Intl.NumberFormat(locales);

    return (amount: number) => `${formatter.format(amount)} ${currency}`;
  }
}
