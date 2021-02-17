import { VkApi, VkApiStorage } from './types';

export function createAPIFromStorageDomain(storage: VkApiStorage): VkApi {
  return { storage };
}
