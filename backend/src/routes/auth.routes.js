import express from "express";
import { register, logout, check, login } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
const authRoutes = express.Router();

authRoutes.post("/register",register)
authRoutes.post("/logout",authMiddleware,logout)
authRoutes.get("/check",authMiddleware,check)
authRoutes.post("/login",login)



export default authRoutes;