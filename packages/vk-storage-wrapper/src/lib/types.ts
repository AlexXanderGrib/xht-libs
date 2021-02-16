export type GetKeysParams = {
  user_id?: number;
  offset?: number;
  count?: number;
};
export type GetKeysResponse = string[];

export type GetParams = {
  user_id?: number;
  key?: string;
  keys?: string[] | string;
};
export type GetResponse = { key: string; value: string }[];

export type SetParams = { user_id?: number; key: string; value?: string };
export type SetResponse = 1;

export interface VkApiStorage {
  getKeys(params: GetKeysParams): Promise<GetKeysResponse>;
  get(params: GetParams): Promise<GetResponse>;
  set(params: SetParams): Promise<SetResponse>;
}

export type ExecuteParams = { code: string };

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
