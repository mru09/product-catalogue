import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  listTopRatedProducts,
  listUserRatings,
  saveProductRating
} from "./rating.controller.js";

export const ratingRouter = Router();
ratingRouter.use(requireAuth);
ratingRouter.get("/top-rated", asyncHandler(listTopRatedProducts));
ratingRouter.get("/", asyncHandler(listUserRatings));
ratingRouter.put("/products/:id", asyncHandler(saveProductRating));
