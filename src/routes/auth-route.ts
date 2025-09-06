import { Router } from "express";
import { registerController } from "../controllers/auth/register";
const route = Router();

route.post("/register", registerController)

export const authRoutes = route;