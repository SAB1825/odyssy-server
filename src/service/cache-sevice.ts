import redis from "../utils/redis-client";

const SESSION_PREFIX = "session:";
const SESSION_TTL = 7 * 24 * 60 * 60; 

export interface CachedData {
  userId: string;
  token: string;
  expiresAt: string;
}

export const getSessionCache = async (
  token: string
): Promise<CachedData | null> => {
  try {
    const cache = await redis.get(`${SESSION_PREFIX}${token}`);
    if (!cache) return null;
    return JSON.parse(cache) as CachedData;
  } catch (error) {
    console.error("Error getting session from cache:", error);
    return null;
  }
};

export const setSessionCache = async (data: CachedData): Promise<void> => {
  try {
    await redis.setex(
      `${SESSION_PREFIX}${data.token}`,
      SESSION_TTL,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error("Error setting session in cache:", error);
  }
};

export const deleteSessionCache = async (token: string): Promise<void> => {
  try {
    await redis.del(`${SESSION_PREFIX}${token}`);
  } catch (error) {
    console.error("Error deleting session from cache:", error);
  }
};
