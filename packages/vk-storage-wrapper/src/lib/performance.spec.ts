import { CachedStorage } from './cached-storage';
import { SlowMockStorage } from './mock-storage';
import { IStorage } from './types';

jest.setTimeout(30000);

describe('Cached Storage', () => {
  const suit = async (storage: IStorage) => {
    const initialized = await storage
      .getKeys()
      .then((k) => k.includes('initialized'));

    const balances = await storage.getFields(
      'balance',
      'special_balance',
      'game_balance'
    );

    if (!initialized) {
      // Some init & register logic here
      balances.balance = 'OVER 9999';

      await storage.set('initialized', 'true');
    }

    await storage.sync(balances);

    // ... Many lines of code here ...

    const otherBalances = await storage.getFields(
      'balance',
      'special_balance',
      'game_balance'
    );

    await storage.sync(otherBalances);

    await storage.get('achievements');
    // Unlock it
    await storage.set('achievements', '/** some achievement data */');
  };

  const storage = new SlowMockStorage();
  const cached = new CachedStorage(storage);

  test('Slow', () => suit(storage));
  test('Cached', () => suit(cached));
});
