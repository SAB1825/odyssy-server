import redis from "../utils/redis-client";

const SESSION_PREFIX = "session:";
const SESSION_TTL = 7 * 24 * 60 * 60;

const VERIFICATION_PREFIX = "verify:";
const VERIFICATION_TTL = 10 * 60;

const USER_PREFIX = "user:";
const USER_TTL = 7 * 24 * 60 * 60;

export interface CachedData {
  userId: string;
  token: string;
  expiresAt: string;
}

export interface VerificationData {
  email: string;
  userId?: string;
  identifier: string;
  token: string;
  expiresAt: string;
}

export interface UserData {
  id : string;
  name : string;
  email : string;
  emailVerified : boolean;
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

export const setVerificationTokenCache = async (
  data: VerificationData
): Promise<void> => {
  try {
    await redis.setex(
      `${VERIFICATION_PREFIX}${data.token}`,
      VERIFICATION_TTL,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error("Error setting verification token in cache:", error);
  }
};

export const getVerificationTokenCache = async (
  token: string

): Promise<VerificationData | null> => {
  try {
    const cache = await redis.get(`${VERIFICATION_PREFIX}${token}`);
    if (!cache) return null;
    return JSON.parse(cache) as VerificationData;
  } catch (error) {
    console.error("Error getting verification token from cache:", error);
    return null;
  }
};

export const deleteVerificationTokenCache = async (
  token: string
): Promise<void> => {
  try {
    await redis.del(`${VERIFICATION_PREFIX}${token}`);
  } catch (error) {
    console.error("Error deleting verification token from cache:", error);
  }
};


export const userCache = async (
  data : UserData
) => {
  try {
    const userId = data.id;
    await redis.setex(`${USER_PREFIX}${userId}`, USER_TTL, JSON.stringify(data));
  } catch (error) {
    console.error("Error setting user in cache:", error);
  }
}
