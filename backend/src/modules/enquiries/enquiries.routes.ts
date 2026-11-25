import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { submitEnquiry } from "./enquiries.controller.js";

const router = Router();
router.post("/", asyncHandler(submitEnquiry));
export default router;
