import { getEnv } from "../utils/get-env";


export const ENV_CONFIG = () => ({
    PORT : getEnv("PORT", "3000"),
    DATABASE_URL : getEnv("DATABASE_URL", ""),
    RESEND_API_KEY : getEnv("RESEND_API_KEY", ""),
    JWT_SECRET : getEnv("JWT_SECRET", "blahblah"),
    PUBLIC_URL : getEnv("PUBLIC_URL", "http://localhost:3000"),
});

export const Env = ENV_CONFIG()