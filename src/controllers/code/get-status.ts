import { Request, Response } from "express";
import { AppError } from "../../utils/app-error";
import { HTTPSTATUS } from "../../config/http-codes";
import { db } from "../../db";
import { savedCodes } from "../../db/schema";
import { eq } from "drizzle-orm";
import { sendSuccess } from "../../utils/response-handler";
import { getCodeCache } from "../../service/cache-sevice";

export const getJobStatusController = async (req: Request, res: Response) => {
  const { codeToken } = req.body; 
  
  try {
    if (!codeToken || typeof codeToken !== 'string') {
      throw new AppError(
        "Code token required",
        HTTPSTATUS.BAD_REQUEST,
        "CODE_ERROR"
      );
    } 
    
    const result = await getCodeCache(codeToken)

    if (!result) {
      throw new AppError("Job not found", HTTPSTATUS.NOT_FOUND, "CODE_ERROR");
    }

    return sendSuccess(
        res,
        "Job status fetched successfully",
        {
            job: result
        }
    )
  } catch (error) {
    throw error;
  }
};
