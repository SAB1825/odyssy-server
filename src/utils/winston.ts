import { createLogger, format, transports } from "winston";

const { combine, timestamp, colorize, printf, label } = format;

export const createLabeledLogger = (service: string) =>
  createLogger({
    level: "debug",
    format: combine(
      label({ label: service }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      colorize(),
      printf(({ timestamp, level, message, label }) => {
        return `[${label}] ${timestamp} ${level}: ${message}`;
      })
    ),
    transports: [new transports.Console()],
  });

export const serverLogger = createLabeledLogger("SERVER");
export const workerLogger = createLabeledLogger("WORKER");
export const redisLogger = createLabeledLogger("REDIS");
export const publisherLogger = createLabeledLogger("PUBLISHER");
