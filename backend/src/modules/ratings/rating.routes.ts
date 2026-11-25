import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";

export const ratingRouter = Router();
ratingRouter.use(requireAuth);
