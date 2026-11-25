import type { Request, Response } from "express";
import type { Types } from "mongoose";
import { Product } from "../../models/Product.js";
import { Rating } from "../../models/Rating.js";

type PopulatedProduct = {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
};

function respondUnauthenticated(response: Response): void {
  response.status(401).json({ message: "Please log in" });
}

export async function listUserRatings(request: Request, response: Response): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    respondUnauthenticated(response);
    return;
  }

  const ratings = await Rating.find({ user: userId }).lean();
  response.json(ratings);
}

export async function listTopRatedProducts(
  request: Request,
  response: Response
): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    respondUnauthenticated(response);
    return;
  }

  const ratings = await Rating.find({ user: userId })
    .populate<{ product: PopulatedProduct | null }>({
      path: "product",
      select: "title description price category image"
    })
    .sort({ rating: -1, updatedAt: -1 })
    .lean();

  const rows = ratings.flatMap((row) =>
    row.product ? [{ product: row.product, rating: row.rating }] : []
  );
  response.json(rows);
}

export async function saveProductRating(request: Request, response: Response): Promise<void> {
  const userId = request.userId;
  if (!userId) {
    respondUnauthenticated(response);
    return;
  }

  const rating = Number(request.body?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    response.status(400).json({ message: "Rating must be an integer from 1 to 5" });
    return;
  }

  const product = await Product.findById(request.params.id);
  if (!product) {
    response.status(404).json({ message: "Product not found" });
    return;
  }

  await Rating.findOneAndUpdate(
    { user: userId, product: product.id },
    { rating },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  response.json({ message: "Your rating was saved", rating });
}
