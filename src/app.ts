import express from "express";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { authRoutes } from "./routes/auth-route";
import { errorHandler } from "./middlewares/error-handler";

dotenv.config();
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).send("API is healthy");
});

app.use("/api/auth", authRoutes);

app.use(errorHandler)

export default app;