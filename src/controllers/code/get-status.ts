import { Request, Response } from "express";
import { AppError } from "../../utils/app-error";
import { errorMessage } from "../../config/error-messages";
import { HTTPSTATUS } from "../../config/http-codes";
import { db } from "../../db";
import { savedCodes } from "../../db/schema";
import { eq } from "drizzle-orm";
import { sendSuccess } from "../../utils/response-handler";

export const getJobStatusController = async (req: Request, res: Response) => {
  const { jobId } = req.body; 
  
  try {
    if (!jobId || typeof jobId !== 'string') {
      throw new AppError(
        "Job ID is required",
        HTTPSTATUS.BAD_REQUEST,
        "JOB_STATUS_ERROR"
      );
    }
    
    const result = await db
      .select()
      .from(savedCodes)
      .where(eq(savedCodes.jobId, jobId));

    if (!result || result.length === 0) {
      throw new AppError("Job not found", HTTPSTATUS.NOT_FOUND, "CODE_ERROR");
    }

    return sendSuccess(
        res,
        "Job status fetched successfully",
        {
            job: result[0]
        }
    )
  } catch (error) {
    throw error;
  }
};
