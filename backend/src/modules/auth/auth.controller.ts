import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { User } from "../../models/User.js";

export async function login(request: Request, response: Response): Promise<void> {
  const email = String(request.body?.email ?? "").trim().toLowerCase();
  const password = String(request.body?.password ?? "");

  if (!email || !password) {
    response.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await User.findOne({ email });
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    response.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const userId = user._id.toString();
  const token = jwt.sign({ userId }, env.jwtSecret, { expiresIn: "7d" });
  response.json({
    token,
    user: {
      id: userId,
      name: user.name ?? "",
      email
    }
  });
}
