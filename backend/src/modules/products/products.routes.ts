import { Router } from "express";
import {
  listProducts,
  listCategories,
  getProduct,
} from "./products.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
const router = Router();
router.get("/", asyncHandler(listProducts));
router.get("/categories", asyncHandler(listCategories));
router.get("/:id", asyncHandler(getProduct));
export default router;
