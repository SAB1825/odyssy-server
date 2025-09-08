import { Request, Response } from "express";
import z from "zod";
import { createVerification, getUserByEmail } from "../../service/auth-service";
import { AppError } from "../../utils/app-error";
import { errorMessage } from "../../config/error-messages";
import { HTTPSTATUS } from "../../config/http-codes";
import {
  createVerificationToken,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../../service/email-service";
import { Env } from "../../config/env-config";
import { sendSuccess } from "../../utils/response-handler";
import { setVerificationTokenCache } from "../../service/cache-sevice";
import { VERIFICATION_IDENTIFIER } from "../../utils/contanst";

export const forgetPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const validatedEmail = z.email().parse(email);

    const existingUser = await getUserByEmail(validatedEmail);

    if (!existingUser) {
      throw new AppError(
        errorMessage.USER_NOT_FOUND,
        HTTPSTATUS.NOT_FOUND,
        "FORGET_PASSWORD_ERROR"
      );
    }

    if (!existingUser.emailVerified) {
      throw new AppError(
        errorMessage.EMAIL_NOT_VERIFIED,
        HTTPSTATUS.BAD_REQUEST,
        "FORGET_PASSWORD_ERROR"
      );
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    const token = await createVerificationToken(
      Env.JWT_SECRET,
      validatedEmail,
      600 // 10 minutes
    );

    await sendPasswordResetEmail(validatedEmail, token);

    await setVerificationTokenCache({
      email: validatedEmail,
      token,
      identifier: VERIFICATION_IDENTIFIER.PASSWORD_RESET,
      expiresAt,
    });

    const passwordReset = await createVerification(
      token,
      VERIFICATION_IDENTIFIER.PASSWORD_RESET
    );

    return sendSuccess(res, "Password reset email sent successfully", {
      email: validatedEmail,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(
        errorMessage.INVALID_EMAIL,
        HTTPSTATUS.BAD_REQUEST,
        "FORGET_PASSWORD_ERROR"
      );
    }
    throw error;
  }
};
