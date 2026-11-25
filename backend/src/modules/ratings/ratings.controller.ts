import type { Response } from "express";
import { Rating, Product } from "../../models/index.js";
import type { AuthRequest } from "../../middleware/auth.js";
export async function getMyTopRated(req: AuthRequest, res: Response) {
  const rows = await Rating.find({ user: req.userId })
    .populate("product")
    .sort({ rating: -1, updatedAt: -1 })
    .lean();
  res.json(
    rows
      .filter((x) => x.product)
      .map((x) => ({ product: x.product, rating: x.rating })),
  );
}
export async function getMyRatings(req: AuthRequest, res: Response) {
  res.json(await Rating.find({ user: req.userId }).lean());
}
export async function saveRating(req: AuthRequest, res: Response) {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return res
      .status(400)
      .json({ message: "Rating must be an integer from 1 to 5" });
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  await Rating.findOneAndUpdate(
    { user: req.userId, product: product.id },
    { rating },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.json({ message: "Your rating was saved", rating });
}
