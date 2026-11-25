import type { Request, Response } from "express";
import type { FilterQuery } from "mongoose";
import { Product } from "../../models/Product.js";

type ProductFilter = FilterQuery<{ category?: string; title?: string }>;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listProducts(request: Request, response: Response): Promise<void> {
  const filter: ProductFilter = {};
  const category = request.query.category;
  if (typeof category === "string") {
    filter.category = category;
  }

  const rawSearch = request.query.q;
  const search = typeof rawSearch === "string" ? rawSearch.trim().slice(0, 100) : "";
  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }

  const products = await Product.find(filter)
    .sort({ category: 1, title: 1 })
    .limit(100)
    .lean();
  response.json(products);
}

export async function listCategories(_request: Request, response: Response): Promise<void> {
  const categories = await Product.distinct("category", {
    category: { $type: "string" }
  });
  response.json(categories);
}

export async function getProduct(request: Request, response: Response): Promise<void> {
  const product = await Product.findById(request.params.id).lean();
  if (!product) {
    response.status(404).json({ message: "Product not found" });
    return;
  }
  response.json(product);
}
