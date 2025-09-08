import { Request, Response } from "express";
import { deleteSessionCache } from "../../service/cache-sevice";
import { cleanUpOldSessionsFromDb } from "../../service/auth-service";
import { sendSuccess } from "../../utils/response-handler";

export const logOutController = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies["odyssy_session_token"];
    if (cookie) {
      res.clearCookie("odyssy_session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      await deleteSessionCache(cookie);
      await cleanUpOldSessionsFromDb(req.userId as string);
    }
    return sendSuccess(res, "User logged out successfully", {
      userId: req.userId,
    });
  } catch (error) {
    console.error("Logout Error: ", error);
    return sendSuccess(res, "User logged out successfully", {
      userId: req.userId,
    });
  }

};
