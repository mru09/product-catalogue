import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { Product } from "./models/Product.js";
import { Rating } from "./models/Rating.js";
import { User } from "./models/User.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { enquiryRouter } from "./modules/enquiries/enquiry.routes.js";
import { productRouter } from "./modules/products/product.routes.js";
import { ratingRouter } from "./modules/ratings/rating.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

export const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/me", ratingRouter);
app.use("/api/enquiries", enquiryRouter);
app.use(notFound);
app.use(errorHandler);

async function startServer(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
  await Promise.all([Product.init(), User.init(), Rating.init()]);
  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to start API server:", error);
  process.exitCode = 1;
});
