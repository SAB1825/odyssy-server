import { Router } from "express";
import { executeCodeController } from "../controllers/code/execute-code";
import { getOutputController } from "../controllers/code/get-output";
import { apiMiddleware } from "../middlewares/api-middleware";

const router = Router();

router.post("/execute", apiMiddleware, executeCodeController);

router.get("/job",apiMiddleware, getOutputController)

export { router as codeRoutes };
