import {
  GetKeysParams,
  GetKeysResponse,
  GetParams,
  GetResponse,
  SetParams,
  VkApiStorage,
} from './types';

export class MockStorageDomain implements VkApiStorage {
  private readonly _storage = new Map<number, Map<string, string>>();

  private _getStorage(userId = 0) {
    if (this._storage.has(userId)) {
      return this._storage.get(userId) as Map<string, string>;
    }

    const storage = new Map<string, string>();

    this._storage.set(userId, storage);
    return storage;
  }

  async getKeys(params: GetKeysParams): Promise<GetKeysResponse> {
    const start = params.offset ?? 0;
    const end = start + (params.count ?? 100);
    const keys = this._getStorage(params.user_id).keys();

    return [...keys].slice(start, end);
  }

  async get(params: GetParams): Promise<GetResponse> {
    const storage = this._getStorage(params.user_id);
    const keys = Array.isArray(params.keys)
      ? params.keys
      : params.keys?.split(',') ?? [params.key];
    const results: GetResponse = [];

    for (const key of keys) {
      const value = storage.get(key) ?? '';

      results.push({ key, value });
    }

    return results;
  }

  async set(params: SetParams): Promise<1> {
    const storage = this._getStorage(params.user_id);

    if (params.value) {
      storage.set(params.key, params.value);
    } else {
      storage.delete(params.key);
    }

    return 1;
  }
}
