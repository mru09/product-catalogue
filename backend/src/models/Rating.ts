import { model, Schema } from "mongoose";

const ratingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", index: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: (value: number) => Number.isInteger(value),
        message: "Rating must be an integer"
      }
    }
  },
  { timestamps: true }
);

ratingSchema.index({ user: 1, product: 1 }, { unique: true });

export const Rating = model("Rating", ratingSchema);
