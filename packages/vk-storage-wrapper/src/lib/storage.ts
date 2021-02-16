import { AbstractStorage } from './abstract-storage';
import { VkApi } from './types';

export class Storage extends AbstractStorage {
  constructor(private readonly _api: VkApi, public readonly userId?: number) {
    super();
  }

  public async getKeys(): Promise<string[]> {
    return await this._api.storage.getKeys({ user_id: this.userId });
  }

  public async get(key: string): Promise<string> {
    const [record] = await this._api.storage.get({ key, user_id: this.userId });

    return record.value;
  }

  public async getFields<K extends string[]>(
    ...keys: K
  ): Promise<{ [key in K[number]]: string }> {
    const records = await this._api.storage.get({ keys, user_id: this.userId });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = {} as any;

    for (const { key, value } of records) {
      result[key as K[number]] = value;
    }

    return result;
  }

  public async set(key: string, value: string) {
    await this._api.storage.set({
      user_id: this.userId,
      key,
      value,
    });
  }

  public async delete(key: string) {
    await this._api.storage.set({
      user_id: this.userId,
      key,
      value: '',
    });
  }

  private async _optimizedSync(
    keys: string[],
    state: Record<string, string>
  ): Promise<boolean> {
    if (!this._api.execute) return false;

    let code = 'return [';

    code += keys
      .map((key) => {
        const value = state[key];

        return `API.storage.set({
          key: ${JSON.stringify(key)},
          value: ${JSON.stringify(value)},
          user_id: ${JSON.stringify(this.userId)}
        })`;
      })
      .join(); // By default .join uses ","

    code += '];';

    try {
      await this._api.execute({ code });
      return true;
    } catch {
      return false;
    }
  }

  public async sync(
    record: Record<string, string>,
    diffWith?: Record<string, string>
  ) {
    const keys = Object.keys(record);
    const remote = diffWith ?? (await this.getFields(...keys));

    // Keys Diff
    const keysDiff = keys.filter((k) => record[k] !== remote[k]);
    const optimizedKeys = keysDiff.splice(0, 25); // API.execute can handle only 25 requests

    // OQ = Optimized Query
    const isOQSuccessful = this._api.execute
      ? await this._optimizedSync(optimizedKeys, record)
      : false;

    if (!isOQSuccessful) {
      keysDiff.unshift(...optimizedKeys);
    }

    await Promise.all(
      keysDiff.map((key) => {
        const value = record[key];

        return this._api.storage.set({ key, value, user_id: this.userId });
      })
    );
  }
}
