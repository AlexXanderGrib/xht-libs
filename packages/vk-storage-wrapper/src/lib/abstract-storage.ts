import { IStorage } from './types';

export abstract class AbstractStorage implements IStorage {
  public static isStorage(something): something is AbstractStorage {
    return (
      something &&
      typeof something === 'object' &&
      something instanceof AbstractStorage
    );
  }

  abstract getKeys(): Promise<string[]>;
  abstract get(key: string): Promise<string>;
  abstract getFields<K extends string[]>(
    ...keys: K
  ): Promise<{ [key in K[number]]: string }>;
  abstract set(key: string, value: string): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract sync(
    data: Record<string, string>,
    remote?: Record<string, string>
  ): Promise<void>;
}
