import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { User } from "../../models/index.js";
import { env } from "../../config/env.js";
export async function login(req: Request, res: Response) {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "");
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash || "")))
    return res.status(401).json({ message: "Invalid email or password" });
  const token = jwt.sign({ userId: user.id }, env.jwtSecret, {
    expiresIn: "7d",
  });
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}
