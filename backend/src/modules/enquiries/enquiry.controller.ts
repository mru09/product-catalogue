import type { Request, Response } from "express";
import nodemailer from "nodemailer";
import { Types } from "mongoose";
import { env } from "../../config/env.js";
import { Product } from "../../models/Product.js";

const invalidEnquiryMessage = "Please provide valid enquiry details.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function submitEnquiry(request: Request, response: Response): Promise<void> {
  const body: unknown = request.body;
  if (
    !isRecord(body) ||
    typeof body.productId !== "string" ||
    !/^[0-9a-f]{24}$/i.test(body.productId) ||
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.phone !== "string" ||
    (body.message !== undefined && typeof body.message !== "string")
  ) {
    response.status(400).json({ message: invalidEnquiryMessage });
    return;
  }

  const productId = body.productId;
  const name = body.name.trim();
  const email = body.email.trim();
  const phone = body.phone.trim();
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    !name ||
    name.length > 100 ||
    !email ||
    email.length > 254 ||
    !emailPattern.test(email) ||
    !phone ||
    phone.length > 40 ||
    message.length > 2000 ||
    !Types.ObjectId.isValid(productId)
  ) {
    response.status(400).json({ message: invalidEnquiryMessage });
    return;
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    response.status(404).json({ message: "Product not found." });
    return;
  }

  if ([env.smtpHost, env.smtpUser, env.smtpPass, env.smtpFrom].some((value) => !value.trim())) {
    response.status(503).json({ message: "Enquiry email service is not configured." });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: { user: env.smtpUser, pass: env.smtpPass }
  });
  await transporter.sendMail({
    from: env.smtpFrom,
    to: "queendev1998@gmail.com",
    replyTo: email,
    subject: `Product enquiry: ${product.title}`,
    text: [
      `Product: ${product.title}`,
      `Product ID: ${product._id.toString()}`,
      `Customer name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Message: ${message || "(none)"}`
    ].join("\n")
  });

  response.status(200).json({ message: "Enquiry submitted successfully." });
}
