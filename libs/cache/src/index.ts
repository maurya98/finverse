import { createClient, RedisClientType } from "redis";

export class Cache {
  public readonly redis: RedisClientType;

  constructor() {
    this.redis = createClient({
      url: `redis://${process.env.REDIS_HOST || "localhost"}:${
        process.env.REDIS_PORT || "6379"
      }`,
      password: process.env.REDIS_PASSWORD,
    }) as RedisClientType;
    this.redis.connect();
  }

  // async sadd(key: string, ...members: string[]) {
  //   try {
  //     // @ts-ignore
  //     return await this.redis.sAdd(key, members);
  //   } catch (error) {
  //     console.error("Error adding to set:", error);
  //     return 0;
  //   }
  // }

  // async srem(key: string, ...members: string[]) {
  //   try {
  //     // @ts-ignore
  //     return await this.redis.sRem(key, members);
  //   } catch (error) {
  //     console.error("Error removing from set:", error);
  //     return 0;
  //   }
  // }

  // async smembers(key: string) {
  //   try {
  //     // @ts-ignore
  //     return await this.redis.sMembers(key);
  //   } catch (error) {
  //     console.error("Error getting set members:", error);
  //     return [];
  //   }
  // }

  async get(key: string) {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error("Error getting cache:", error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600) {
    // Default TTL is 1 hour (3600 seconds)
    try {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);
      return await this.redis.setEx(key, ttl, stringValue);
    } catch (error) {
      console.error("Error setting cache:", error);
      return null;
    }
  }

  async del(key: string) {
    try {
      return await this.redis.del(key);
    } catch (error) {
      console.error("Error deleting cache:", error);
      return 0;
    }
  }

  async keys(pattern: string = "*") {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error("Error listing cache keys:", error);
      return [];
    }
  }

  async exists(key: string) {
    try {
      return (await this.redis.exists(key)) === 1;
    } catch (error) {
      console.error("Error checking cache key:", error);
      return false;
    }
  }
}

export default new Cache();
