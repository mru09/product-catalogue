import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: Number,
    category: { type: String, index: true },
    image: String,
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true },
);
const userSchema = new mongoose.Schema(
  { name: String, email: { type: String, unique: true }, passwordHash: String },
  { timestamps: true },
);
const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      index: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true },
);
ratingSchema.index({ user: 1, product: 1 }, { unique: true });
export const Product = mongoose.model("Product", productSchema);
export const User = mongoose.model("User", userSchema);
export const Rating = mongoose.model("Rating", ratingSchema);
