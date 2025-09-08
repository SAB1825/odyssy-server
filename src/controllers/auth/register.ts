import { Request, Response } from "express";
import { registerSchema } from "../../validators/auth-validator";
import { AppError } from "../../utils/app-error";
import { HTTPSTATUS } from "../../config/http-codes";
import { errorMessage } from "../../config/error-messages";
import { ZodError } from "zod";
import {
  createEmailVerification,
  createUser,
  getUserByEmail,
} from "../../service/auth-service";
import {
  createVerificationToken,
  sendVerificationEmail,
} from "../../service/email-service";
import { setVerificationTokenCache } from "../../service/cache-sevice";
import { VERIFICATION_IDENTIFIER } from "../../utils/contanst";

export const registerController = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const body = registerSchema.parse({
      name,
      email,
      password,
    });

    const existingUser = await getUserByEmail(body.email);

    if (existingUser) {
      throw new AppError(
        errorMessage.USER_ALREADY_EXISTS,
        HTTPSTATUS.BAD_REQUEST,
        "AUTH_ERROR"
      );
    }

    const token = await sendVerificationEmail(body.email);

    //CREATE IN DB
    const newVerification = await createEmailVerification(token);

    // CACHING THE VERIFICATION TOKEN
    await setVerificationTokenCache({
      expiresAt: newVerification[0].expiresAt.toISOString(),
      email: body.email,
      identifier: VERIFICATION_IDENTIFIER.EMAIL_VERIFICATION,
      token,
    });

    const newUser = await createUser(body.name, body.email, body.password);

    return res.status(HTTPSTATUS.CREATED).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(
        JSON.stringify(error.flatten().fieldErrors),
        HTTPSTATUS.BAD_REQUEST,
        "ZOD_VALIDATION_ERROR"
      );
    }
    throw error;
  }
};
