import { Subscribeable } from './subscribeable';
import {
  GetKeysParams,
  GetKeysResponse,
  GetParams,
  GetResponse,
  SetParams,
  VkApiStorage,
} from './types';

type MockApiEvents =
  | { type: 'getKeys'; user_id?: number }
  | { type: 'get'; keys: string[]; user_id?: number }
  | { type: 'set'; key: string; value: string; user_id?: number };

export class MockStorageDomain implements VkApiStorage {
  public readonly storage = new Map<number, Map<string, string>>();
  public readonly events = new Subscribeable<MockApiEvents>();

  private _getStorage(userId = 0) {
    if (this.storage.has(userId)) {
      return this.storage.get(userId) as Map<string, string>;
    }

    const storage = new Map<string, string>();

    this.storage.set(userId, storage);
    return storage;
  }

  async getKeys(params: GetKeysParams): Promise<GetKeysResponse> {
    const start = params.offset ?? 0;
    const end = start + (params.count ?? 100);
    const keys = this._getStorage(params.user_id).keys();

    this.events.emit({
      type: 'getKeys',
      user_id: params.user_id,
    });

    return [...keys].slice(start, end);
  }

  async get(params: GetParams): Promise<GetResponse> {
    const storage = this._getStorage(params.user_id);
    const keys = Array.isArray(params.keys)
      ? params.keys
      : params.keys?.split(',') ?? [params.key];
    this.events.emit({
      type: 'get',
      keys,
      user_id: params.user_id,
    });

    const results: GetResponse = [];

    for (const key of keys) {
      const value = storage.get(key) ?? '';

      results.push({ key, value });
    }

    return results;
  }

  async set(params: SetParams): Promise<1> {
    const storage = this._getStorage(params.user_id);

    this.events.emit({
      type: 'set',
      key: params.key,
      value: params.value,
      user_id: params.user_id,
    });

    if (params.value) {
      storage.set(params.key, params.value);
    } else {
      storage.delete(params.key);
    }

    return 1;
  }
}
