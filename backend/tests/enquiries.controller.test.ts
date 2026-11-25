import type { Request, Response } from "express";
import nodemailer from "nodemailer";
import { env } from "../src/config/env.js";
import { Product } from "../src/models/index.js";
import { submitEnquiry } from "../src/modules/enquiries/enquiries.controller.js";

jest.mock("../src/config/env.js", () => ({
  env: {
    smtpHost: "smtp.example.com",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "smtp-user",
    smtpPass: "smtp-password",
    smtpFrom: "store@example.com",
  },
}));

jest.mock("../src/models/index.js", () => ({
  Product: {
    findById: jest.fn(),
  },
  Rating: {},
  User: {},
}));

jest.mock("nodemailer", () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(),
  },
}));

const productFindById = jest.mocked(Product.findById);
const createTransport = jest.mocked(nodemailer.createTransport);

const productId = "507f1f77bcf86cd799439011";
const product = { _id: productId, title: "Desk Lamp" };
const validEnquiry = {
  productId,
  name: "Alex Customer",
  email: "alex@example.com",
  phone: "+1 555 0100",
  message: "Is this lamp available?",
};

function createRequest(body: unknown = validEnquiry) {
  return { body } as Request;
}

function createResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };
  response.status.mockReturnValue(response);
  return response as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
}

function mockFoundProduct(found: unknown = product) {
  const lean = jest.fn().mockResolvedValue(found);
  productFindById.mockReturnValue({ lean } as never);
  return lean;
}

beforeEach(() => {
  jest.clearAllMocks();
  env.smtpHost = "smtp.example.com";
  env.smtpPort = 587;
  env.smtpSecure = false;
  env.smtpUser = "smtp-user";
  env.smtpPass = "smtp-password";
  env.smtpFrom = "store@example.com";
  mockFoundProduct();
  createTransport.mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({}),
  } as never);
});

it.each([
  [{ ...validEnquiry, productId: "invalid-id" }],
  [{ ...validEnquiry, name: "   " }],
  [{ ...validEnquiry, email: "not-an-email" }],
  [{ ...validEnquiry, phone: "" }],
  [{ ...validEnquiry, message: 123 }],
])("rejects invalid enquiry details", async (body) => {
  const response = createResponse();

  await submitEnquiry(createRequest(body), response);

  expect(response.status).toHaveBeenCalledWith(400);
  expect(response.json).toHaveBeenCalledWith({
    message: "Please provide valid enquiry details.",
  });
  expect(productFindById).not.toHaveBeenCalled();
});

it("returns 404 when the enquiry references a missing product", async () => {
  mockFoundProduct(null);
  const response = createResponse();

  await submitEnquiry(createRequest(), response);

  expect(productFindById).toHaveBeenCalledWith(productId);
  expect(response.status).toHaveBeenCalledWith(404);
  expect(response.json).toHaveBeenCalledWith({
    message: "Product not found.",
  });
  expect(createTransport).not.toHaveBeenCalled();
});

it("returns 503 when SMTP is not configured", async () => {
  env.smtpHost = undefined;
  const response = createResponse();

  await submitEnquiry(createRequest(), response);

  expect(response.status).toHaveBeenCalledWith(503);
  expect(response.json).toHaveBeenCalledWith({
    message: "Enquiry email service is not configured.",
  });
  expect(createTransport).not.toHaveBeenCalled();
});

it("sends a product enquiry email and returns success", async () => {
  const sendMail = jest.fn().mockResolvedValue({});
  createTransport.mockReturnValue({ sendMail } as never);
  const response = createResponse();

  await submitEnquiry(
    createRequest({
      ...validEnquiry,
      name: "  Alex Customer ",
      email: " alex@example.com ",
      phone: " +1 555 0100 ",
      message: " Is this lamp available? ",
    }),
    response,
  );

  expect(productFindById).toHaveBeenCalledWith(productId);
  expect(createTransport).toHaveBeenCalledWith({
    host: "smtp.example.com",
    port: 587,
    secure: false,
    auth: { user: "smtp-user", pass: "smtp-password" },
  });
  expect(sendMail).toHaveBeenCalledWith({
    from: "store@example.com",
    to: "queendev1998@gmail.com",
    replyTo: "alex@example.com",
    subject: "Product enquiry: Desk Lamp",
    text: [
      "Product: Desk Lamp",
      `Product ID: ${productId}`,
      "Name: Alex Customer",
      "Email: alex@example.com",
      "Phone: +1 555 0100",
      "Message: Is this lamp available?",
    ].join("\n"),
  });
  expect(response.status).toHaveBeenCalledWith(200);
  expect(response.json).toHaveBeenCalledWith({
    message: "Enquiry submitted successfully.",
  });
});

it("sends a placeholder when the enquiry message is omitted", async () => {
  const sendMail = jest.fn().mockResolvedValue({});
  createTransport.mockReturnValue({ sendMail } as never);

  await submitEnquiry(
    createRequest({
      productId,
      name: "Alex Customer",
      email: "alex@example.com",
      phone: "+1 555 0100",
    }),
    createResponse(),
  );

  expect(sendMail).toHaveBeenCalledWith(
    expect.objectContaining({
      text: expect.stringContaining("Message: (none)"),
    }),
  );
});
