import { errorMessagesType } from "../config/error-messages";
import { httpStatusCodeType } from "../config/http-codes";

export class AppError extends Error {
  public errorCode: httpStatusCodeType;
  public messageCode: errorMessagesType;

  constructor(
    message: string,
    errorCode: httpStatusCodeType,
    messageCode: errorMessagesType,
    name?: string
  ) {
    super(message);
    this.name = name || "AppError"; // WHERE ERROR OCCURES (EG. DB, AUTH, ETC)
    this.message = message; // HUMAN READABLE MESSAGE
    this.errorCode = errorCode; // HTTP STATUS CODE(200, 400, 500, ETC)
    this.messageCode = messageCode; // MACHINE READABLE MESSAGE(EG. USER_NOT_FOUND, INVALID_PASSWORD, ETC)
  }
}
