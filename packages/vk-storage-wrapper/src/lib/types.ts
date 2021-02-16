type GetKeysParams = { user_id?: number; offset?: number; count?: number };
type GetKeysResponse = string[];

type GetParams = { user_id?: number; key?: string; keys?: string[] | string };
type GetResponse = { key: string; value: string }[];

type SetParams = { user_id?: number; key: string; value?: string };
type SetResponse = 1;

export interface VkApiStorage {
  getKeys(params: GetKeysParams): Promise<GetKeysResponse>;
  get(params: GetParams): Promise<GetResponse>;
  set(params: SetParams): Promise<SetResponse>;
}

type ExecuteParams = { code: string };

export interface VkApi {
  storage: VkApiStorage;
  execute?(params: ExecuteParams): Promise<unknown>;
}

export interface IStorage {
  getKeys(): Promise<string[]>;
  get(key: string): Promise<string>;
  getFields<K extends string[]>(
    ...keys: K
  ): Promise<{ [key in K[number]]: string }>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  sync(
    data: Record<string, string>,
    remote?: Record<string, string>
  ): Promise<void>;
}
