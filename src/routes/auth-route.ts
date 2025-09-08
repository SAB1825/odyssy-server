import { Router } from "express";
import { registerController } from "../controllers/auth/register";
import { loginController } from "../controllers/auth/login";
import { authMiddleware } from "../middlewares/auth-middleware";
import { getUser } from "../controllers/auth/user";
import { verifyEmailController } from "../controllers/auth/verify-email";
import { forgetPasswordController } from "../controllers/auth/forget-password";
import { resetPasswordController } from "../controllers/auth/reset-password";
const route = Router();

route.post("/register", registerController)
route.post("/login", loginController)
route.post("/verify-email", verifyEmailController)
route.post("/forget-password", forgetPasswordController)
route.post("/reset-password", resetPasswordController)

route.get("/me", authMiddleware, getUser)

export const authRoutes = route;