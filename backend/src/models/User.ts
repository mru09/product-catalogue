import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, lowercase: true },
    passwordHash: { type: String }
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
