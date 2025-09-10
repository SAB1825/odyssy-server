import Redis from "ioredis";
import { Env } from "../config/env-config";
import { redisLogger } from "./winston";

const redis = new Redis({
  host: Env.REDIS_HOST,
  port: 6379,
  // maxRetriesPerRequest: 3,
  // lazyConnect: true,
  // keepAlive: 30000,
});

redis.on("connect", () => {
  redisLogger.info("Connected to Redis server");
});

redis.on("error", (err) => {
  redisLogger.error("Error connecting to Redis server:", err);
});

export default redis;
