import { AbstractStorage } from './abstract-storage';
import { MockStorage } from './mock-storage';
import type { IStorage } from './types';

export class CachedStorage<O extends IStorage> extends AbstractStorage {
  private readonly _cache = new MockStorage();

  constructor(public readonly origin: O) {
    super();
  }

  getKeys(): Promise<string[]> {
    return this.origin.getKeys();
  }

  async get(key: string): Promise<string> {
    const cached = await this._cache.get(key);
    if (cached) return cached;

    const remote = await this.origin.get(key);
    if (remote !== cached) await this._cache.set(key, remote);

    return remote;
  }

  async getFields<K extends string[]>(
    ...keys: K
  ): Promise<{ [key in K[number]]: string }> {
    const cached = await this._cache.getFields(...keys);
    const missing = Object.keys(cached).filter((key) => !!cached[key]);

    if (missing.length === 0) return cached;

    const remaining = await this.origin.getFields(...keys);

    await this._cache.sync(remaining, cached);

    return { ...cached, ...remaining };
  }

  async set(key: string, value: string): Promise<void> {
    await Promise.all([
      this.origin.set(key, value),
      this._cache.set(key, value),
    ]);
  }

  async delete(key: string): Promise<void> {
    await Promise.all([this.origin.delete(key), this._cache.delete(key)]);
  }

  async sync(
    data: Record<string, string>,
    remote?: Record<string, string>
  ): Promise<void> {
    remote ??= await this.getFields(...Object.keys(data));

    return this.origin.sync(data, remote);
  }
}
