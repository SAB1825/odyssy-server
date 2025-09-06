import { Router } from "express";
import { registerController } from "../controllers/auth/register";
import { loginController } from "../controllers/auth/login";
import { authMiddleware } from "../middlewares/auth-middleware";
import { getUser } from "../controllers/auth/user";
const route = Router();

route.post("/register", registerController)
route.post("/login", loginController)
route.get("/me", authMiddleware, getUser)

export const authRoutes = route;