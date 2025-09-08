import Redis from "ioredis";
import { Env } from "../config/env-config";

const redis = new Redis({
  host: Env.REDIS_HOST,
  port: 6379,
  // maxRetriesPerRequest: 3,
  // lazyConnect: true,
  // keepAlive: 30000,
});

redis.on("connect", () => {
  console.log(
    `[Redis]: Connected to Redis server at ${Env.REDIS_HOST}:${Env.REDIS_PORT}`
  );
});

redis.on("error", (err) => {
  console.error("[Redis]: Error connecting to Redis server:", err);
});

export default redis;
