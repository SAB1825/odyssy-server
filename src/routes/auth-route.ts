import { Router } from "express";
import { registerController } from "../controllers/auth/register";
import { loginController } from "../controllers/auth/login";
const route = Router();

route.post("/register", registerController)
route.post("/login", loginController)

export const authRoutes = route;