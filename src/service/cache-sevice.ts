import redis from "../utils/redis-client";
import { redisLogger } from "../utils/winston";

const SESSION_PREFIX = "session:";
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days

const VERIFICATION_PREFIX = "verify:";
const VERIFICATION_TTL = 10 * 60; // 10 minutes

const USER_PREFIX = "user:";
const USER_TTL = 7 * 24 * 60 * 60; // 7 days

const CODE_PREFIX = "code:";
const CODE_TTL = 1 * 60 * 60; // 1 hour

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



export interface CodeData {
  jobId? : string;
  codeHash : string;
  success: boolean;
  output?: string;
  error?: string;
  status? : string;
  executionTime?: number;
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

export const setCodeCache = async (data : CodeData) => {
  try {
    await redis.setex(`${CODE_PREFIX}${data.codeHash}`, CODE_TTL, JSON.stringify(data));
  } catch (error) {
    console.error("Error setting code in cache:", error);
  }
}

export const getCodeCache = async (codeHash : string) : Promise<CodeData | null> => {
  try {
    const cache = await redis.get(`${CODE_PREFIX}${codeHash}`);
    if (!cache) return null;
    return JSON.parse(cache) as CodeData;
  } catch (error) {
    console.error("Error getting code from cache:", error);
    return null;
  }
}

export const deleteCodeCache = async (codeHash : string) => {
  try {
    await redis.del(`${CODE_PREFIX}${codeHash}`);
  } catch (error) {
    console.error("Error deleting code from cache:", error);
  }
}

export const setOutputCache = async (codeHash : string, output : string, status : string) => {
  try {
    const data =  {
      output,
      status
    }
    await redis.setex(`${CODE_PREFIX}${codeHash}`, CODE_TTL, JSON.stringify(data))
  }catch(e) {
    redisLogger.error("Error While setuping up cache.")
  }
}

export const getOutputCache = async (codeHash : string)  => {
  try {
    const cache = await redis.get(`${CODE_PREFIX}${codeHash}`);
    if(!cache) return null;
    const data = JSON.parse(cache) as {output: string, status: string};
    return data;
  } catch (error) {
     redisLogger.error("Error While getting up cache.")
  }
}

