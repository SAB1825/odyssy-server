import { ErrorRequestHandler } from "express";
import { AppError } from "../utils/app-error";


export const errorHandler : ErrorRequestHandler = (
    error,
    req,
    res,
    next 
) : any => {
    console.log(`Error occured at: ${req.path}`);
    if(error instanceof AppError) {
        return res.status(error.errorCode).json({
            message : error.message,
            errorCode : error.errorCode
        })
    }
    return res.status(500).json({
        message: "Internal Server Error",
        errorCode: "INTERNAL_SERVER_ERROR"
    });
}