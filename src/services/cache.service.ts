import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 });

export const cacheService = {
  async getOrSet(key: string, callback: () => Promise<any>, ttl: number = 300) {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    const result = await callback();
    cache.set(key, result, ttl);
    return result;
  },
};
