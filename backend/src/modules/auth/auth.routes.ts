import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { login } from "./auth.controller.js";

export const authRouter = Router();
authRouter.post("/login", asyncHandler(login));
