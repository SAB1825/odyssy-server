import { Request, Response } from "express";
import { executeCode } from "../../service/code-service";
import { sendSuccess } from "../../utils/response-handler";
import { HTTPSTATUS } from "../../config/http-codes";
import { AppError } from "../../utils/app-error";
import { ZodError } from "zod";
import { z } from "zod";

const executeCodeSchema = z.object({
  code: z.string().min(1, "Code is required").max(10000, "Code is too long"),
  language: z.enum(["c", "cpp", "c++", "java", "python", "javascript", "js"])
    .refine((val) => ["c", "cpp", "c++", "java", "python", "javascript", "js"].includes(val), {
      message: "Unsupported language"
    })
});

export const executeCodeController = async (req: Request, res: Response) => {
  try {
    const { code, language } = executeCodeSchema.parse(req.body);

    if (code.includes("rm -rf") || code.includes("format") || code.includes("system(")) {
      throw new AppError(
        "Code contains potentially dangerous operations",
        HTTPSTATUS.BAD_REQUEST,
        "SECURITY_ERROR"
      );
    }

    const result = await executeCode(code, language);

    return sendSuccess(
      res,
      result.success ? "Code executed successfully" : "Code execution failed",
      {
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        language,
        success: result.success
      },
      result.success ? HTTPSTATUS.OK : HTTPSTATUS.BAD_REQUEST
    );

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
