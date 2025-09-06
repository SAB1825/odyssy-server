/// <reference path="../types/global.d.ts" />
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { errorMessage } from "../config/error-messages";
import { HTTPSTATUS } from "../config/http-codes";
import { db } from "../db";
import { session } from "../db/schema";
import { eq } from "drizzle-orm";
import { cleanUpOldSessions, createSession } from "../service/auth-service";
import { v4 as uuid } from "uuid";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cookie = req.cookies["odyssy_session_token"];
    console.log("Auth Middleware - Session Token:", cookie);
    if (!cookie) {
      throw new AppError(
        errorMessage.UNAUTHORIZED,
        HTTPSTATUS.UNAUTHORIZED,
        "AUTH_ERROR"
      );
    }

    const currSession = await db
      .select()
      .from(session)
      .where(eq(session.token, cookie));

    console.log("Auth Middleware - Current Session:", currSession);


    const expiresAt = currSession[0]?.expiresAt;
    if (expiresAt && new Date() > expiresAt) {
      throw new AppError(
        errorMessage.UNAUTHORIZED,
        HTTPSTATUS.UNAUTHORIZED,
        "AUTH_ERROR"
      );
    }

    if (
      expiresAt &&
      new Date(expiresAt).getTime() - Date.now() < 1 * 24 * 60 * 60 * 1000
    ) {
      await cleanUpOldSessions(currSession[0]?.userId);

      const token = uuid();

      const newSession = await createSession(
        token,
        currSession[0]?.userId,
        req.ip as string,
        req.headers["user-agent"] as string
      );



      res.cookie("odyssy_session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    console.log("Auth Middleware - User ID:", currSession[0]?.userId);

    const userId = currSession[0]?.userId;
    req.userId = userId;
    next();
  } catch (error) {
    console.log("Auth Middleware - Error:", error);
    next(error);
  }
};
