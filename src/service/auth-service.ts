import { eq } from "drizzle-orm";
import { db } from "../db";
import { account, session, user } from "../db/schema";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { v6 as uuid } from "uuid";

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

export const cleanUpOldSessions = async (userId : string) => {
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

  const newSession = await  db.insert(session).values({
    id : sessionId,
    token,
    ipAddress,
    userAgent,
    expiresAt,
    userId
  })

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

