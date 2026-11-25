import type { Request, Response } from "express";
import { Product } from "../../models/index.js";
export async function listProducts(req: Request, res: Response) {
  const filter: Record<string, unknown> = {};
  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.q) {
    const q = String(req.query.q).trim().slice(0, 100);
    filter.title = { $regex: q, $options: "i" };
  }
  const products = await Product.find(filter)
    .sort({ category: 1, title: 1 })
    .limit(100)
    .lean();
  res.json(products);
}
export async function listCategories(_req: Request, res: Response) {
  res.json(await Product.distinct("category"));
}
export async function getProduct(req: Request, res: Response) {
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
}
