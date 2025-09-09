import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Request, Response } from "express";
import { authRoutes } from "./routes/auth-route";
import { codeRoutes } from "./routes/code-route";
import { errorHandler } from "./middlewares/error-handler";

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).send("API is healthy");
});

app.use("/api/auth", authRoutes);
app.use("/api/code", codeRoutes);


app.use(errorHandler);

export default app;
