import { Response } from "express";
import { httpStatusCodeType } from "../config/http-codes";

interface SuccessResponseData {
  [key: string]: any;
}

interface SuccessResponse {
  success: true;
  message: string;
  data?: SuccessResponseData;
  timestamp: string;
}

export class ResponseHandler {
  static success(
    res: Response,
    message: string,
    data?: SuccessResponseData,
    statusCode: httpStatusCodeType = 200
  ): Response {
    const response: SuccessResponse = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };

    if (data) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  static created(
    res: Response,
    message: string,
    data?: SuccessResponseData
  ): Response {
    return this.success(res, message, data, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}

// Helper functions for common responses
export const sendSuccess = ResponseHandler.success;
export const sendCreated = ResponseHandler.created;
export const sendNoContent = ResponseHandler.noContent;
