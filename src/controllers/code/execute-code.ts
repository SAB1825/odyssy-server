import { Request, Response } from "express";
import { executeCode } from "../../service/code-service";
import { sendSuccess } from "../../utils/response-handler";
import { HTTPSTATUS } from "../../config/http-codes";
import { AppError } from "../../utils/app-error";
import { ZodError } from "zod";
import { z } from "zod";
import { queueCodeExecution } from "../../workers/queue";
import { generateCodeHash } from "../../utils/crypto";
import { getCodeCache, setCodeCache } from "../../service/cache-sevice";

const executeCodeSchema = z.object({
  code: z.string().min(1, "Code is required").max(10000, "Code is too long"),
  language: z
    .enum(["c", "cpp", "c++", "java", "python", "javascript", "js"])
    .refine(
      (val) =>
        ["c", "cpp", "c++", "java", "python", "javascript", "js"].includes(val),
      {
        message: "Unsupported language",
      }
    ),
  isQueue: z.boolean().optional(),
});

export const executeCodeController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId as string;
    const { code, language, isQueue } = executeCodeSchema.parse(req.body);

    const hashedCode = generateCodeHash(code, language);

    let cacheCode = await getCodeCache(hashedCode);

    if (cacheCode) {
      return sendSuccess(res, "Code executed successfully (from cache)", {
        data: cacheCode,
      });
    }

    if (
      code.includes("rm -rf") ||
      code.includes("format") ||
      code.includes("system(")
    ) {
      throw new AppError(
        "Code contains potentially dangerous operations",
        HTTPSTATUS.BAD_REQUEST,
        "SECURITY_ERROR"
      );
    }

    const jobId = await queueCodeExecution(userId, code, language);
    await setCodeCache({
      codeHash : hashedCode,
      jobId,
      status : "QUEUED",
      success : false
    });

    return sendSuccess(res, `Job queued successfully`, {
      code_token : hashedCode,
      status: "QUEUED",

    });
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(
        JSON.stringify(error.flatten().fieldErrors),
        HTTPSTATUS.BAD_REQUEST,
        "VALIDATION_ERROR"
      );
    }

    if (error instanceof AppError) {
      throw error;
    }

    console.error("Code execution error:", error);
    throw new AppError(
      "Failed to execute code",
      HTTPSTATUS.INTERNAL_SERVER_ERROR,
      "EXECUTION_ERROR"
    );
  }
};
