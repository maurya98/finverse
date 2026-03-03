import { createClient, RedisClientType } from "redis";

export class Cache {
  public readonly redis: RedisClientType;
  private connectionPromise: Promise<void>;
  private connected = false;

  constructor() {
    this.redis = createClient({
      url: `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || "6379"}`,
      password: process.env.REDIS_PASSWORD,
    }) as RedisClientType;

    // Connect asynchronously; resolve either way so app can start even if Redis is down
    this.connectionPromise = this.redis
      .connect()
      .then(() => {
        this.connected = true;
      })
      .catch((error: Error & { code?: string }) => {
        const msg = error?.message ?? error?.code ?? "unknown";
        console.error(`Redis unavailable (${msg}). App will run without cache.`);
        this.connected = false;
      });
  }

  // Wait for connection attempt to finish (success or failure)
  private async ensureConnected(): Promise<void> {
    await this.connectionPromise;
  }

  private async whenConnected<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    await this.ensureConnected();
    if (!this.connected) return fallback;
    try {
      return await fn();
    } catch (error) {
      console.error("Redis operation failed:", error);
      return fallback;
    }
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
    return this.whenConnected(() => this.redis.get(key), null);
  }

  async set(key: string, value: any, ttl: number = 3600) {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    return this.whenConnected(() => this.redis.setEx(key, ttl, stringValue), null);
  }

  async del(key: string) {
    return this.whenConnected(() => this.redis.del(key), 0);
  }

  async keys(pattern: string = "*") {
    return this.whenConnected(() => this.redis.keys(pattern), []);
  }

  async exists(key: string) {
    return this.whenConnected(
      async () => (await this.redis.exists(key)) === 1,
      false
    );
  }
}

export default new Cache();
