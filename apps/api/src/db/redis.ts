import { Redis, type RedisOptions } from "ioredis";
import { env } from "../config/env.js";

function baseRedisOptions(overrides?: RedisOptions): RedisOptions {
  const options: RedisOptions = {
    connectTimeout: 15_000,
    keepAlive: 30_000,
    enableReadyCheck: true,
    retryStrategy: (times) => {
      if (times > 20) {
        return null;
      }

      return Math.min(times * 300, 5_000);
    },
    reconnectOnError: (error) => {
      const message = error.message.toLowerCase();
      return message.includes("econnreset") || message.includes("etimedout");
    },
    ...overrides
  };

  if (env.REDIS_URL.startsWith("rediss://")) {
    options.tls = {};
  }

  return options;
}

function attachRedisHandlers(client: Redis, name: string) {
  client.on("error", (error) => {
    console.error(`[redis:${name}]`, error.message);
  });

  client.on("reconnecting", () => {
    console.warn(`[redis:${name}] reconnecting...`);
  });
}

function createRedisClient(name: string, overrides?: RedisOptions) {
  const client = new Redis(env.REDIS_URL, baseRedisOptions(overrides));
  attachRedisHandlers(client, name);
  return client;
}

/** BullMQ only — do not use for Socket.IO or pub/sub. */
export const bullmqConnection = createRedisClient("bullmq", {
  maxRetriesPerRequest: null
});

/** Regular commands: cache keys, publish progress events. */
export const redisPub = createRedisClient("pub");

/** Socket.IO adapter subscriber — duplicated from pub. */
export const redisSub = redisPub.duplicate();
attachRedisHandlers(redisSub, "socket-sub");

/** Custom progress channel subscriber — separate from Socket.IO adapter. */
export const progressSub = redisPub.duplicate();
attachRedisHandlers(progressSub, "progress-sub");

/** @deprecated Use bullmqConnection */
export const redisConnection = bullmqConnection;

/** @deprecated Use redisPub */
export const cacheClient = redisPub;

export async function ensureRedisReady() {
  const clients = [bullmqConnection, redisPub];

  await Promise.all(
    clients.map(
      (client) =>
        new Promise<void>((resolve, reject) => {
          if (client.status === "ready") {
            resolve();
            return;
          }

          const onReady = () => {
            cleanup();
            resolve();
          };

          const onError = (error: Error) => {
            cleanup();
            reject(error);
          };

          const cleanup = () => {
            client.off("ready", onReady);
            client.off("error", onError);
          };

          client.once("ready", onReady);
          client.once("error", onError);
        })
    )
  );
}
