import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { submitEnquiry } from "./enquiry.controller.js";

export const enquiryRouter = Router();
enquiryRouter.post("/", asyncHandler(submitEnquiry));
