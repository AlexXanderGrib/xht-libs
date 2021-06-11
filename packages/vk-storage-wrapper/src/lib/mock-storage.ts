import { EventBus } from '@xxhax/events';
import { AbstractStorage } from './abstract-storage';

type MockStorageEvents =
  | { type: 'get'; keys: string[] }
  | { type: 'getKeys' }
  | { type: 'set'; key: string; value: string }
  | { type: 'delete'; key: string }
  | { type: 'sync'; keys: string[] };

export class MockStorage extends AbstractStorage {
  public readonly data = new Map<string, string>();
  public readonly events = new EventBus<MockStorageEvents>();

  async getKeys(): Promise<string[]> {
    this.events.emit({ type: 'getKeys' });

    return [...this.data.keys()];
  }
  async get(key: string): Promise<string> {
    this.events.emit({ type: 'get', keys: [key] });

    return this.data.get(key) ?? '';
  }
  async getFields<K extends string[]>(
    ...keys: K
  ): Promise<{ [key in K[number]]: string }> {
    const record: Record<string, string> = Object.fromEntries(
      keys.map((key) => [key, ''])
    );

    this.events.emit({ type: 'get', keys });

    for (const [key, value] of this.data.entries()) {
      if (keys.includes(key)) record[key] = value ?? '';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return record as any;
  }

  async set(key: string, value: string): Promise<void> {
    this.data.set(key, value);
    this.events.emit({ type: 'set', key, value });
  }

  async sync(
    data: Record<string, string>,
    diffWith?: Record<string, string>
  ): Promise<void> {
    const keys = Object.keys(data);
    const remote = diffWith ?? (await this.getFields(...keys));

    const diffKeys = keys.filter((k) => data[k] !== remote[k]);

    this.events.emit({ type: 'sync', keys: diffKeys });

    for (const key of diffKeys) {
      this.data.set(key, data[key] ?? '');
    }
  }

  async delete(key: string) {
    this.data.delete(key);
    this.events.emit({ type: 'delete', key });
  }
}

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export class SlowMockStorage extends MockStorage {
  public timeout = 476; // Around 476 ms

  async getKeys(): Promise<string[]> {
    await sleep(this.timeout);
    return super.getKeys();
  }

  async get(key: string): Promise<string> {
    await sleep(this.timeout);
    return super.get(key);
  }

  async getFields<K extends string[]>(
    ...keys: K
  ): Promise<{ [key in K[number]]: string }> {
    await sleep(this.timeout);
    return super.getFields(...keys);
  }

  async set(key: string, value: string): Promise<void> {
    await sleep(this.timeout);
    return super.set(key, value);
  }

  async delete(key: string): Promise<void> {
    await sleep(this.timeout);
    return super.delete(key);
  }

  async sync(
    data: Record<string, string>,
    remote?: Record<string, string>
  ): Promise<void> {
    await sleep(this.timeout);
    return super.sync(data, remote);
  }
}
