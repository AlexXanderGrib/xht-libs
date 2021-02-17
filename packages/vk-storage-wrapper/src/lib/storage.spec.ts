import { createAPIFromStorageDomain } from './create-api';
import { MockStorageDomain } from './mock-api';
import { MockStorage } from './mock-storage';
import { Storage } from './storage';
import type { IStorage } from './types';

describe('VK Storage Mocks', () => {
  const _ = <T>(
    action: (storage: IStorage) => Promise<T>,
    compare: (r1: T, r2: T) => void
  ) => {
    const api = createAPIFromStorageDomain(new MockStorageDomain());
    const storage1 = new Storage(api);
    const storage2 = new MockStorage();

    return async () => {
      const result1 = await action(storage1);
      const result2 = await action(storage2);

      return compare(result1, result2);
    };
  };

  const checker = <T>(a: T, b: T) => expect(a).toEqual(b);

  test(
    'should have same keys after same mutations',
    _(async (storage) => {
      await storage.set('a', 'b');

      return storage.getKeys();
    }, checker)
  );

  test(
    'should have same returns after same mutations',
    _(async (storage) => {
      const object = {
        email: 'aye@pidoraz.com',
        password: '428a7c298b4810475377',
      };

      await storage.sync(object);

      const result = await storage.getFields('email', 'password');

      expect(result).toEqual(object);

      return result;
    }, checker)
  );
});
