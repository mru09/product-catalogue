import { Router } from "express";
import { login } from "./auth.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
const router = Router();
router.post("/login", asyncHandler(login));
export default router;
