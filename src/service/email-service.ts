import { Env } from "../config/env-config";
import { signJWT } from "../utils/jwt";
import resend from "../utils/resend";

export const createVerificationToken = async (
  secret: string,
  email: string,

  expiresIn: number = 3600
) => {
  const token = await signJWT(
    {
      email,
    },
    secret,
    expiresIn
  );

  return token;
};



export const sendVerificationEmail = async (email: string) => {
  try {
    const token = await createVerificationToken(Env.JWT_SECRET, email, 600000);

    const url = `${Env.PUBLIC_URL}/verify-email?token=${token}&email=${email}`;

    await resend.emails.send({
      from: "noreply@sabaris.site",
      to: [email],
      subject: "Verify your email",
      html: `<p>Click <a href="${url}">here</a> to verify your email. This link will expire in 10 minutes.</p>`,
    });

    return token;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendPasswordResetEmail = async (email: string, token : string) => {
  try {
    

    const url = `${Env.PUBLIC_URL}/reset-password?token=${token}&email=${email}`;
    await resend.emails.send({
      from: "noreply@sabaris.site",
      to: [email],
      subject: "Reset your password",
      html: `<p>Click ${token} to reset your password. This link will expire in 10 minutes.</p>`,
    });

    return token;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}
