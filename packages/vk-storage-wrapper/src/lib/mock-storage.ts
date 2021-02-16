import { AbstractStorage } from './abstract-storage';

export class MockStorage extends AbstractStorage {
  private readonly data = new Map<string, string>();

  async getKeys(): Promise<string[]> {
    return [...this.data.keys()];
  }
  async get(key: string): Promise<string> {
    return this.data.get(key) ?? '';
  }
  async getFields<K extends string[]>(
    ...keys: K
  ): Promise<{ [key in K[number]]: string }> {
    const record: Record<string, string> = Object.fromEntries(
      keys.map((key) => [key, ''])
    );

    for (const [key, value] of this.data.entries()) {
      if (keys.includes(key)) record[key] = value ?? '';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return record as any;
  }

  async set(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async sync(
    data: Record<string, string>,
    diffWith?: Record<string, string>
  ): Promise<void> {
    const keys = Object.keys(data);
    const remote = diffWith ?? (await this.getFields(...keys));

    const diffKeys = keys.filter((k) => data[k] !== remote[k]);

    for (const key of diffKeys) {
      this.data.set(key, data[key] ?? '');
    }
  }

  async delete(key: string) {
    this.data.delete(key);
  }
}
