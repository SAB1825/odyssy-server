// SECURITY IMPROVEMENTS FOR EMAIL VERIFICATION

/**
 * Issues to fix:
 * 
 * 1. EMAIL ENUMERATION ATTACK
 *    - Current: Different error messages reveal if email exists
 *    - Fix: Use generic error messages
 * 
 * 2. TIMING ATTACK
 *    - Current: Different response times based on cache hit/miss
 *    - Fix: Consistent response times
 * 
 * 3. TOKEN REUSE
 *    - Current: No prevention of token reuse after failure
 *    - Fix: Implement rate limiting
 * 
 * 4. INSUFFICIENT LOGGING
 *    - Current: Console.log for debugging
 *    - Fix: Proper audit logging for security events
 */

// RECOMMENDED IMPROVEMENTS:

// 1. Rate limiting per email/IP
const VERIFICATION_ATTEMPTS_LIMIT = 5;
const VERIFICATION_WINDOW = 15 * 60 * 1000; // 15 minutes

// 2. Generic error responses
const GENERIC_ERROR = "Invalid or expired verification link";

// 3. Audit logging
interface SecurityLog {
  action: string;
  email?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  reason?: string;
}

// 4. Enhanced validation
const enhancedVerifyEmailSchema = z.object({
  token: z.string()
    .min(10, "Invalid token format")
    .max(1000, "Token too long")
    .regex(/^[A-Za-z0-9._-]+$/, "Invalid token characters"),
  email: z.string()
    .email("Invalid email format")
    .max(254, "Email too long")
    .toLowerCase()
});
