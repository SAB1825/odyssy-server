import { getEnv } from "../utils/get-env";


export const ENV_CONFIG = () => ({
    PORT : getEnv("PORT", "3000"),
    DATABASE_URL : getEnv("DATABASE_URL", ""),
    RESEND_API_KEY : getEnv("RESEND_API_KEY", ""),
    JWT_SECRET : getEnv("JWT_SECRET", "blahblah"),
    PUBLIC_URL : getEnv("PUBLIC_URL", "http://localhost:3000"),
    REDIS_HOST : getEnv("REDIS_HOST", "localhost"),
    REDIS_PORT : getEnv("REDIS_PORT", "6379"),

    RABBITMQ_URL : getEnv("RABBITMQ_URL", "amqp://localhost"),
    QUEUE_NAME : getEnv("QUEUE_NAME", "code_execution_queue")
});

export const Env = ENV_CONFIG()