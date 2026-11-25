import type { Request, Response } from "express";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { Product } from "../../models/index.js";

const salesInbox = "queendev1998@gmail.com";
//https://ethereal.email/messages
export async function submitEnquiry(req: Request, res: Response) {
  const { productId, name, email, phone, message } = req.body ?? {};
  if (
    typeof productId !== "string" ||
    !mongoose.isValidObjectId(productId) ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    (message !== undefined && typeof message !== "string")
  ) {
    return res.status(400).json({ message: "Please provide valid enquiry details." });
  }

  const customerName = name.trim();
  const customerEmail = email.trim();
  const customerPhone = phone.trim();
  const customerMessage = typeof message === "string" ? message.trim() : "";
  if (
    !customerName ||
    customerName.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ||
    customerEmail.length > 254 ||
    !customerPhone ||
    customerPhone.length > 40 ||
    customerMessage.length > 2000
  ) {
    return res.status(400).json({ message: "Please provide valid enquiry details." });
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.smtpFrom) {
    return res.status(503).json({ message: "Enquiry email service is not configured." });
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });
  await transporter.sendMail({
    from: env.smtpFrom,
    to: salesInbox,
    replyTo: customerEmail,
    subject: `Product enquiry: ${product.title}`,
    text: [
      `Product: ${product.title}`,
      `Product ID: ${product._id}`,
      `Name: ${customerName}`,
      `Email: ${customerEmail}`,
      `Phone: ${customerPhone}`,
      `Message: ${customerMessage || "(none)"}`,
    ].join("\n"),
  });

  res.status(200).json({ message: "Enquiry submitted successfully." });
}
