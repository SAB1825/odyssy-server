import { Request, Response } from "express";
import { loginSchema } from "../../validators/auth-validator";
import { cleanUpOldSessionsFromDb, createSession, getUserByEmail, isPasswordCorrect } from "../../service/auth-service";
import { AppError } from "../../utils/app-error";
import { errorMessage } from "../../config/error-messages";
import { HTTPSTATUS } from "../../config/http-codes";
import { v6 as uuid } from "uuid";

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const body = loginSchema.parse({
      email,
      password,
    });

    const existingUser = await getUserByEmail(body.email);

    if (!existingUser) {
      throw new AppError(
        errorMessage.USER_EMAIL_NOT_FOUND,
        HTTPSTATUS.NOT_FOUND,
        "AUTH_ERROR"
      );
    }

    if (!existingUser.emailVerified) {
      throw new AppError(
        errorMessage.EMAIL_NOT_VERIFIED,
        HTTPSTATUS.FORBIDDEN,
        "AUTH_ERROR"
      );
    }

    const isMatch = await isPasswordCorrect(body.password, existingUser.id);

    if (!isMatch) {
      throw new AppError(
        errorMessage.INVALID_EMAIL_OR_PASSWORD,
        HTTPSTATUS.UNAUTHORIZED,
        "AUTH_ERROR"
      );
    };

    //CREATE : SESSION

    const ipAddress  = req.ip;
    const userAgent = req.get("User-Agent") || "";

    await cleanUpOldSessionsFromDb(existingUser.id);

    const token = uuid({
        random: crypto.getRandomValues(new Uint8Array(32))
    })

    const session = await createSession(
        token,
        existingUser.id,
        ipAddress as string,
        userAgent
    )

    res.cookie("odyssy_session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.status(HTTPSTATUS.OK).json({
      status: "success",
      message: "User logged in successfully",
    })

  } catch (error) {
    throw error;
  }
};
