import { eq } from "drizzle-orm";
import { db } from "../db";
import { account, user } from "../db/schema";
import { hashPassword } from "../utils/bcrypt";
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
