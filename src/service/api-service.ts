import { db } from "../db";
import { api } from "../db/schema";

import { v4 as uuid } from "uuid";
import { serverLogger } from "../utils/winston";
import { eq } from "drizzle-orm";

export const createAPIService = async (token: string, userId: string) => {
  try {
    const newAPI = await db
      .insert(api)
      .values({
        id: uuid(),
        token,
        isValid: true,
        userId,
      })
      .returning();
    return newAPI;
  } catch (error) {
    serverLogger.info("Something went wrong", error);
  }
};

export const getAPIService = async (token: string) => {
  try {
    const getAPI = await db.select().from(api).where(eq(api.token, token));
    return getAPI;
  } catch (error) {
    serverLogger.info("Something went wrong", error);
  }
};

export const updateAPIService = async (token: string, newToken: string) => {
  try {
    const upatedAPI = await db
      .update(api)
      .set({
        token: newToken,
      })
      .where(eq(api.token, token));
  } catch (error) {
    serverLogger.info("Something went wrong", error);
  }
};
