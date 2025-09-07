/// <reference path="../types/global.d.ts" />
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { errorMessage } from "../config/error-messages";
import { HTTPSTATUS } from "../config/http-codes";
import { db } from "../db";
import { session } from "../db/schema";
import { eq } from "drizzle-orm";
import { cleanUpOldSessionsFromDb, createSession } from "../service/auth-service";
import { v4 as uuid } from "uuid";
import { deleteSessionCache, getSessionCache, setSessionCache } from "../service/cache-sevice";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //GET TOKEN FROM COOKIES
    const cookie = req.cookies["odyssy_session_token"];
    
    if (!cookie) {
      throw new AppError(
        errorMessage.UNAUTHORIZED,
        HTTPSTATUS.UNAUTHORIZED,
        "AUTH_ERROR"
      );
    }

  
    let currSession;


    //GET CURRENT SESSION FROM CACHE(REDIS)
    currSession = await getSessionCache(cookie);

    //IF NOT IN CACHE, GET IT FROM DATABASE
    if (!currSession) {
      const dbSession = await db
        .select()
        .from(session)
        .where(eq(session.token, cookie))
        .limit(1);

      if (!dbSession.length || !dbSession[0]) {
        res.clearCookie("odyssy_session_token");
        throw new AppError(
          errorMessage.UNAUTHORIZED,
          HTTPSTATUS.UNAUTHORIZED,
          "SESSION_NOT_FOUND"
        );
      }

      currSession = {
        userId: dbSession[0].userId,
        expiresAt: dbSession[0].expiresAt?.toISOString() || "",
        token: dbSession[0].token,
      };

      await setSessionCache({
        token: cookie,
        expiresAt: currSession.expiresAt,
        userId: currSession.userId,
      });
    }

    //IF SESSION EXPIRED, THROW ERROR AND CLEANUP
    const expiresAt = new Date(currSession?.expiresAt);
    if (expiresAt && new Date() > expiresAt) {

      await deleteSessionCache(currSession.token);
      await cleanUpOldSessionsFromDb(currSession.userId);
      res.clearCookie("odyssy_session_token");

      throw new AppError(
        errorMessage.UNAUTHORIZED,
        HTTPSTATUS.UNAUTHORIZED,
        "AUTH_ERROR"
      );
    }

    //IF SESSION IS ABOUT TO EXPIRE IN 24 HOURS, RENEW IT
    let newSession = null;
    if (
      expiresAt &&
      new Date(expiresAt).getTime() - Date.now() < 1 * 24 * 60 * 60 * 1000
    ) {

      await cleanUpOldSessionsFromDb(currSession?.userId);

      const token = uuid();

      newSession = await createSession(
        token,
        currSession?.userId,
        req.ip as string,
        req.headers["user-agent"] as string
      );
      
      await deleteSessionCache(currSession.token);
      
      await setSessionCache({
        token: newSession[0].token,
        expiresAt: newSession[0].expiresAt?.toISOString() || "",
        userId: newSession[0].userId,
      })


      res.cookie("odyssy_session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    const userId = newSession ? newSession[0].userId : currSession?.userId;
    req.userId = userId;
    next();
  } catch (error) {
    console.log("Auth Middleware - Error:", error);
    next(error);
  }
};
