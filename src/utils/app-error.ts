import { errorMessagesType } from "../config/error-messages";
import { httpStatusCodeType } from "../config/http-codes";

export class AppError extends Error {
  public errorCode: httpStatusCodeType;

  constructor(
    message: errorMessagesType,
    errorCode: httpStatusCodeType,
    name?: string
  ) {
    super(message);
    this.name = name || "AppError"; // WHERE ERROR OCCURES (EG. DB, AUTH, ETC)
    this.message = message; // HUMAN READABLE MESSAGE
    this.errorCode = errorCode; // HTTP STATUS CODE(200, 400, 500, ETC)
  }
}

