import { Router } from "express";
import { executeCodeController } from "../controllers/code/execute-code";
import { authMiddleware } from "../middlewares/auth-middleware";
import { getJobStatusController } from "../controllers/code/get-status";

const router = Router();

// Code execution route - requires authentication
router.post("/execute", authMiddleware, executeCodeController);

router.get("/job", authMiddleware, getJobStatusController)

export { router as codeRoutes };
