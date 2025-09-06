import { Request, Response } from "express";
import { registerSchema } from "../../validators/auth-validator";
import { AppError } from "../../utils/app-error";
import { HTTPSTATUS } from "../../config/http-codes";
import { errorMessage } from "../../config/error-messages";
import { ZodError } from "zod";
import { createUser, getUserByEmail } from "../../service/auth-service";
import { sendVerificationEmail } from "../../service/email-service";

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
        "User already exists with this email",
        HTTPSTATUS.BAD_REQUEST,
        errorMessage.USER_ALREADY_EXISTS,
        "AUTH_ERROR"
      );
    };

    await sendVerificationEmail(body.email);

    const newUser = await createUser(body.name, body.email, body.password);

    console.log("User created successfully", newUser);

    return res.status(HTTPSTATUS.CREATED).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(
        error.message,
        HTTPSTATUS.INTERNAL_SERVER_ERROR,
        errorMessage.INTERNAL_SERVER_ERROR
      );
    }
    if (error instanceof ZodError) {
      throw new AppError(
        error.message,
        HTTPSTATUS.BAD_REQUEST,
        errorMessage.BAD_REQUEST,
        "ZodError"
      );
    }
  }
};
