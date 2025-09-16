import { Request, Response } from "express"
import { AppError } from "../../utils/app-error";
import { errorMessage } from "../../config/error-messages";
import { HTTPSTATUS } from "../../config/http-codes";
import { generateAPIToken } from "../../utils/crypto";
import { createAPIService } from "../../service/api-service";
import { sendSuccess } from "../../utils/response-handler";


export const createAPIController = async (req : Request, res : Response) => {
    try {
        const userId = req.userId;
        if(!userId) {
            throw new AppError(
                errorMessage.UNAUTHORIZED,
                HTTPSTATUS.UNAUTHORIZED,
                "AUTH_ERROR"
            )
        }
        const token = generateAPIToken(32);

        const apikey = await createAPIService(token , userId)
        if(apikey?.length == 0) {
            throw new AppError(
                errorMessage.INTERNAL_SERVER_ERROR,
                HTTPSTATUS.INTERNAL_SERVER_ERROR
            )
        }
        return sendSuccess(
            res,
            "API token created successfully.",
            {
                token : token
            }
        )
        
    } catch (error) {
        throw error;
    }
}