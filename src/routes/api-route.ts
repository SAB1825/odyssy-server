import { Router } from "express";
import { createAPIController } from "../controllers/api/createApi";
import { authMiddleware } from "../middlewares/auth-middleware";

const route = Router();

route.post("/create",authMiddleware, createAPIController);

export const apiRoute = route;