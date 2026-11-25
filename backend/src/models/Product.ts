import { model, Schema } from "mongoose";

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    category: { type: String, index: true },
    image: { type: String },
    averageRating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Product = model("Product", productSchema);
