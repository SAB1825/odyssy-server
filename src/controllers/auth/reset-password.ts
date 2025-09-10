import { Request, Response } from "express";
import { resetPasswordSchema } from "../../validators/auth-validator";
import { verifyJWT } from "../../utils/jwt";
import { Env } from "../../config/env-config";
import { errorMessage } from "../../config/error-messages";
import { AppError } from "../../utils/app-error";
import { HTTPSTATUS } from "../../config/http-codes";
import {
  deleteVerificationTokenCache,
  getVerificationTokenCache,
} from "../../service/cache-sevice";
import { db } from "../../db";
import { account, verification } from "../../db/schema";
import { eq } from "drizzle-orm";
import { VERIFICATION_IDENTIFIER } from "../../utils/contanst";
import { hashPassword } from "../../utils/bcrypt";
import { getUserByEmail } from "../../service/auth-service";
import { ZodError } from "zod";
import { sendSuccess } from "../../utils/response-handler";

export const resetPasswordController = async (req: Request, res: Response) => {
  const { token, email } = req.query;
  const { password } = req.body;
  try {
    if (!token || !email) {
      throw new AppError(
        errorMessage.BAD_REQUEST,
        HTTPSTATUS.BAD_REQUEST,
        "RESET_PASSWORD_ERROR"
      );
    }
    const data = resetPasswordSchema.parse({
      token: token.toString(),
      email: email.toString().toLowerCase().trim(),
      password,
    });


    let jwtPayload;
    try {
      jwtPayload = await verifyJWT(data.token, Env.JWT_SECRET);
    } catch (error) {
      throw new AppError(
        errorMessage.INVALID_VERIFICATION_LINK,
        HTTPSTATUS.BAD_REQUEST,
        "RESET_PASSWORD_ERROR"
      );
    }

    if (jwtPayload.email !== email) {
      throw new AppError(
        errorMessage.EMAIL_MISMATCH_IN_TOKEN,
        HTTPSTATUS.BAD_REQUEST,
        "RESET_PASSWORD_ERROR"
      );
    }

    let verificationToken = await getVerificationTokenCache(data.token);

    if (!verificationToken) {
      const dbVerification = await db
        .select()
        .from(verification)
        .where(eq(verification.value, data.token));

      if (dbVerification.length === 0) {
        throw new AppError(
          errorMessage.INVALID_TOKEN,
          HTTPSTATUS.BAD_REQUEST,
          "RESET_PASSWORD_ERROR"
        );
      }

      verificationToken = {
        email: data.email,
        identifier: dbVerification[0].identifier,
        token: dbVerification[0].value,
        expiresAt: dbVerification[0].expiresAt.toISOString(),
      };
    }

    if (
      verificationToken.identifier !== VERIFICATION_IDENTIFIER.PASSWORD_RESET
    ) {
      throw new AppError(
        errorMessage.INVALID_TOKEN,
        HTTPSTATUS.BAD_REQUEST,
        "RESET_PASSWORD_ERROR"
      );
    }

    const hashNewPassword = await hashPassword(password);

    const exisitingUser = await getUserByEmail(email);
    if (!exisitingUser) {
      throw new AppError(
        errorMessage.USER_NOT_FOUND,
        HTTPSTATUS.NOT_FOUND,
        "RESET_PASSWORD_ERROR"
      );
    }

    await db
      .update(account)
      .set({ password: hashNewPassword })
      .where(eq(account.userId, exisitingUser.id));

    await db
      .delete(verification)
      .where(eq(verification.value, verificationToken.token));

    await deleteVerificationTokenCache(data.token);

    return sendSuccess(
        res,
        "Password reset successfully",
        {
            user: exisitingUser
        }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(
        error.message,
        HTTPSTATUS.BAD_REQUEST,
        "FORGET_PASSWORD_ERROR"
      );
    }

    throw error;
  }
};
