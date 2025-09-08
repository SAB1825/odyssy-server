import { eq } from "drizzle-orm";
import { db } from "../db";
import { account, session, user, verification } from "../db/schema";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { v6 as uuid } from "uuid";
import { CachedData, setSessionCache } from "./cache-sevice";
import { VERIFICATION_IDENTIFIER } from "../utils/contanst";

export const getUserByEmail = async (email: string) => {
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, email))

  return existingUser[0];
};

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  const hashedPassword = await hashPassword(password);
  const userId = uuid();
  const newUser = await db
    .insert(user)
    .values({
      id: userId,
      email,
      name,
      emailVerified: false,
    })
    .returning();
  const newAccount = await db.insert(account).values({
    password: hashedPassword,
    userId,
    providerId: "credentials",
    accountId: userId,
    id: uuid(),
  });

  return newUser;
};


export const isPasswordCorrect = async (password : string, userId : string)  => {
  const userAccount = await db.select().from(account).where(eq(account.userId, userId));
  if(userAccount.length === 0) return false;

  const isMatch = await comparePassword(password, userAccount[0].password as string);

  return isMatch;
}

export const cleanUpOldSessionsFromDb = async (userId : string) => {
  try {
    await db.delete(session).where(eq(session.userId, userId));
  } catch (error) {
    console.error("Error cleaning up old sessions:", error);
  }
}

export const createSession = async (
  token : string,
  userId : string,
  ipAddress : string | null,
  userAgent : string | null
) => {
  ipAddress = ipAddress || null;
  userAgent = userAgent || null;
  const sessionId = uuid();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const sessionData: CachedData = {
    userId,
    token,
    expiresAt: expiresAt.toISOString(),
  };

  await setSessionCache(sessionData);

  const newSession = await  db.insert(session).values({
    id : sessionId,
    token,
    ipAddress,
    userAgent,
    expiresAt,
    userId
  }).returning();

  return newSession;
}

export const getUserById = async (userId : string) => {
  try {
    const currUser = await db.select().from(user).where(eq(user.id, userId));
    return currUser[0];
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Unable to fetch user");
  }
}


export const createEmailVerification = async (token: string) => {

  try {
    const verificationId = uuid();
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + 10 * 60 * 1000); 
    const newVerification = await db.insert(verification).values({
      id: verificationId,
      identifier: VERIFICATION_IDENTIFIER.EMAIL_VERIFICATION,
      value: token,
      expiresAt,
    }).returning();
    
    return newVerification;
  } catch (error) {
    console.error("Error creating email verification:", error);
    throw new Error("Failed to create email verification");
  }

};