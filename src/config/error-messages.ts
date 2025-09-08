export const errorMessages = () => ( {
	// GENERIC ERRORS
	INTERNAL_SERVER_ERROR: "Internal server error",
	BAD_REQUEST: "Bad request (Check your input)",
	NOT_FOUND: "Resource not found",




	// AUTH ERROR	
	USER_NOT_FOUND: "User not found",
	FAILED_TO_CREATE_USER: "Failed to create user",
	FAILED_TO_CREATE_SESSION: "Failed to create session",
	FAILED_TO_UPDATE_USER: "Failed to update user",
	FAILED_TO_GET_SESSION: "Failed to get session",
	INVALID_PASSWORD: "Invalid password",
	INVALID_EMAIL: "Invalid email",
	INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
	SOCIAL_ACCOUNT_ALREADY_LINKED: "Social account already linked",
	PROVIDER_NOT_FOUND: "Provider not found",
	INVALID_TOKEN: "Invalid token",
	ID_TOKEN_NOT_SUPPORTED: "id_token not supported",
	FAILED_TO_GET_USER_INFO: "Failed to get user info",
	USER_EMAIL_NOT_FOUND: "User email not found",
	EMAIL_NOT_VERIFIED: "Email not verified",
	PASSWORD_TOO_SHORT: "Password too short",
	PASSWORD_TOO_LONG: "Password too long",
	USER_ALREADY_EXISTS: "User already exists. Use another email.",
	EMAIL_CAN_NOT_BE_UPDATED: "Email can not be updated",
	CREDENTIAL_ACCOUNT_NOT_FOUND: "Credential account not found",
	SESSION_EXPIRED: "Session expired. Re-authenticate to perform this action.",
	FAILED_TO_UNLINK_LAST_ACCOUNT: "You can't unlink your last account",
	ACCOUNT_NOT_FOUND: "Account not found",
	USER_ALREADY_HAS_PASSWORD:
		"User already has a password. Provide that to delete the account.",
	UNAUTHORIZED: "Unauthorized. Please login to perform this action.",
	EXPIRED_TOKEN: "Token has expired",

	// EMAIL VERIFICATION SPECIFIC ERRORS
	INVALID_VERIFICATION_LINK: "Invalid or expired verification link",
	VERIFICATION_TOKEN_EXPIRED: "Verification link has expired. Please request a new one.",
	EMAIL_ALREADY_VERIFIED: "Email address is already verified",
	VERIFICATION_TOKEN_NOT_FOUND: "Verification token not found or has been used",
	EMAIL_MISMATCH_IN_TOKEN: "The email in the verification link does not match the provided email",
	INVALID_VERIFICATION_FORMAT: "Invalid verification link format",
})
export const errorMessage = errorMessages();
export type errorMessagesType = typeof errorMessage[keyof typeof errorMessage];