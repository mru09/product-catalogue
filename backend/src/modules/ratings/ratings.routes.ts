import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getMyTopRated,
  getMyRatings,
  saveRating,
} from "./ratings.controller.js";
const router = Router();
router.use(requireAuth);
router.get("/top-rated", asyncHandler(getMyTopRated));
router.get("/", asyncHandler(getMyRatings));
router.put("/products/:id", asyncHandler(saveRating));
export default router;
