import { Router } from "express";
import { executeCodeController } from "../controllers/code/execute-code";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = Router();

// Code execution route - requires authentication
router.post("/execute", authMiddleware, executeCodeController);

export { router as codeRoutes };
