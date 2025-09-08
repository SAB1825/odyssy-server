import { ErrorRequestHandler } from "express";
import { AppError } from "../utils/app-error";
import { HTTPSTATUS } from "../config/http-codes";

export const errorHandler: ErrorRequestHandler = (
    error,
    req,
    res,
    next 
): any => {
    console.error(`Error occurred at: ${req.path}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error.message,
        stack: error.stack
    });

    if (error instanceof AppError) {
        return res.status(error.errorCode).json({
            success: false,
            error: {
                name: error.name || "APP_ERROR",
                message: error.message,
                code: error.errorCode
            },
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }

    if (error.name === 'ValidationError') {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            success: false,
            error: {
                name: "VALIDATION_ERROR",
                message: "Invalid input data",
                code: HTTPSTATUS.BAD_REQUEST
            },
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }

    if (error.name === 'CastError') {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
            success: false,
            error: {
                name: "INVALID_ID",
                message: "Invalid ID format",
                code: HTTPSTATUS.BAD_REQUEST
            },
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
            name: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong. Please try again later.",
            code: HTTPSTATUS.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    });
};