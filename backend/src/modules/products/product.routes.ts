import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { getProduct, listCategories, listProducts } from "./product.controller.js";

export const productRouter = Router();
productRouter.get("/", asyncHandler(listProducts));
productRouter.get("/categories", asyncHandler(listCategories));
productRouter.get("/:id", asyncHandler(getProduct));
