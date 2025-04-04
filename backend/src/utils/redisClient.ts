import { createClient } from "redis";
import { AppConfig } from "../config";
import logger from "./logger";

const redisClient = createClient({
  url: AppConfig.get("REDIS_URL") as string,
});

// Set up event listeners once
redisClient.on("error", (err) => {
  logger.error("Redis client error", { meta: { error: err } });
});

redisClient.on("end", () => {
  logger.info("Redis client disconnected", {
    meta: { url: AppConfig.get("REDIS_URL") },
  });
});

export async function connectRedis() {
  try {
    await redisClient.connect(); // Ensure connection before proceeding
    logger.info("Redis client connected", {
      meta: { url: AppConfig.get("REDIS_URL") },
    });
  } catch (err) {
    logger.error("Redis client connection error", { meta: { error: err } });
    throw err; // Throw error so it can be handled at a higher level
  }
}

export async function disconnectRedis() {
  try {
    await redisClient.quit();
    logger.info("Redis client gracefully disconnected.");
  } catch (err) {
    logger.error("Error while disconnecting Redis", { meta: { error: err } });
  }
}

export default redisClient;
