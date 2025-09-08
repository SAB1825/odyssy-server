import { Request, Response } from "express";
import { verifyEmailSchema } from "../../validators/auth-validator";
import {
  deleteVerificationTokenCache,
  getVerificationTokenCache,
  userCache,
} from "../../service/cache-sevice";
import { user, verification } from "../../db/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { VERIFICATION_IDENTIFIER } from "../../utils/contanst";
import { HTTPSTATUS } from "../../config/http-codes";
import { ZodError } from "zod";
import { verifyJWT } from "../../utils/jwt";
import { Env } from "../../config/env-config";
import { AppError } from "../../utils/app-error";
import { errorMessage } from "../../config/error-messages";
import { sendSuccess } from "../../utils/response-handler";

export const verifyEmailController = async (req: Request, res: Response) => {
  const { token, email } = req.query;

  try {
    const query = verifyEmailSchema.parse({
      token,
      email: email?.toString().toLowerCase().trim(),
    });

    let jwtPayload;
    try {
      jwtPayload = await verifyJWT(query.token, Env.JWT_SECRET);
    } catch (error) {
      throw new AppError(
        errorMessage.INVALID_VERIFICATION_LINK,
        HTTPSTATUS.BAD_REQUEST,
        "EMAIL_VERIFICATION_ERROR"
      );
    }

    if (jwtPayload.email !== query.email) {
      throw new AppError(
        errorMessage.EMAIL_MISMATCH_IN_TOKEN,
        HTTPSTATUS.BAD_REQUEST,
        "EMAIL_VERIFICATION_ERROR"
      );
    }

    let emailVerification = await getVerificationTokenCache(query.token);

    if (!emailVerification) {
      const dbVerification = await db
        .select()
        .from(verification)
        .where(eq(verification.value, query.token));

      if (dbVerification.length === 0) {
        throw new AppError(
          errorMessage.VERIFICATION_TOKEN_NOT_FOUND,
          HTTPSTATUS.NOT_FOUND,
          "EMAIL_VERIFICATION_ERROR"
        );
      }

      emailVerification = {
        token: dbVerification[0].value,
        identifier: dbVerification[0].identifier,
        expiresAt: dbVerification[0].expiresAt.toISOString(),
        email: jwtPayload.email,
      };
    }

    if (
      emailVerification.identifier !==
      VERIFICATION_IDENTIFIER.EMAIL_VERIFICATION
    ) {
      throw new AppError(
        errorMessage.INVALID_VERIFICATION_LINK,
        HTTPSTATUS.BAD_REQUEST,
        "EMAIL_VERIFICATION_ERROR"
      );
    }

    if (new Date(emailVerification.expiresAt) < new Date()) {
      await Promise.all([
        deleteVerificationTokenCache(query.token),
        db.delete(verification).where(eq(verification.value, query.token)),
      ]);

      throw new AppError(
        errorMessage.VERIFICATION_TOKEN_EXPIRED,
        HTTPSTATUS.BAD_REQUEST,
        "EMAIL_VERIFICATION_ERROR"
      );
    }

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, emailVerification.email));

    if (existingUser.length === 0) {
      throw new AppError(
        errorMessage.USER_NOT_FOUND,
        HTTPSTATUS.NOT_FOUND,
        "EMAIL_VERIFICATION_ERROR"
      );
    }

    if (existingUser[0].emailVerified) {
      await Promise.all([
        deleteVerificationTokenCache(query.token),
        db.delete(verification).where(eq(verification.value, query.token)),
      ]);

      return sendSuccess(
        res,
        "Email address is already verified",
        {
          emailVerified: true,
          email: emailVerification.email
        },
        HTTPSTATUS.OK
      );
    }

      await db
        .update(user)
        .set({
          emailVerified: true,
        })
        .where(eq(user.email, emailVerification.email));

      await db.delete(verification).where(eq(verification.value, query.token));

      await userCache({
        id : existingUser[0].id,
        email : existingUser[0].email,
        name : existingUser[0].name,
        emailVerified : true
      })

    await deleteVerificationTokenCache(query.token);
    console.info(`Email verified successfully for: ${emailVerification.email}`);

    return sendSuccess(
      res,
      "Email verified successfully",
      {
        emailVerified: true,
        email: emailVerification.email
      },
      HTTPSTATUS.OK
    );

  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(
        errorMessage.INVALID_VERIFICATION_FORMAT,
        HTTPSTATUS.BAD_REQUEST,
        "VALIDATION_ERROR"
      );
    }

    throw error;
  }
};
