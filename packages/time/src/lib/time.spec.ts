import { measure, sleep } from './time';

describe('Time', () => {
  test(sleep.name, async () => {
    const time = 1000 + Math.round(Math.random() * 1000);
    const start = Date.now();

    await measure(sleep.name, () => sleep(time));

    expect(Date.now()).toBeGreaterThan(start + time);
  });
});
