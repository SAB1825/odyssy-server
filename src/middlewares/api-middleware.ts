import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { errorMessage } from "../config/error-messages";
import { HTTPSTATUS } from "../config/http-codes";
import { getAPIService } from "../service/api-service";
import { serverLogger } from "../utils/winston";

export const apiMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const headers = req.headers["authorization"];
    if (!headers || !headers.startsWith("Bearer ")) {
      throw new AppError(
        errorMessage.INVALID_API_KEY,
        HTTPSTATUS.UNAUTHORIZED,
        "API_KEY_ERROR"
      );
    }
    const apiKey = headers.split(" ")[1];

    const token = await getAPIService(apiKey);

    if (token?.length === 0 || token === undefined) {
      throw new AppError(
        "API key not found",
        HTTPSTATUS.NOT_FOUND,
        "API_KEY_ERROR"
      );
    }

    if (!token[0].isValid) {
      throw new AppError(
        errorMessage.INVALID_API_KEY,
        HTTPSTATUS.UNAUTHORIZED,
        "API_KEY_ERROR"
      );
    }

    next();
  } catch (error) {
    serverLogger.error("API middleware error:", error);
    next(error);
  }
};
