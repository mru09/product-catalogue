import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../src/utils/asyncHandler.js";
import { errorHandler } from "../src/middleware/errorHandler.js";
import { Product } from "../src/models/index.js";
import {
  getProduct,
  listCategories,
  listProducts,
} from "../src/modules/products/products.controller.js";

jest.mock("../src/models/index.js", () => ({
  Product: {
    find: jest.fn(),
    distinct: jest.fn(),
    findById: jest.fn(),
  },
}));

const productFind = jest.mocked(Product.find);
const productDistinct = jest.mocked(Product.distinct);
const productFindById = jest.mocked(Product.findById);

function createRequest(
  query: Request["query"] = {},
  id = "",
): Request {
  return {
    query,
    params: { id },
  } as unknown as Request;
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

function mockProductQuery(result: unknown) {
  const query = {
    sort: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
  };
  query.sort.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.lean.mockResolvedValue(result);
  productFind.mockReturnValue(query as never);
  return query;
}

beforeEach(() => {
  jest.clearAllMocks();
});

it("lists all products with category/title sorting and a limit of 100", async () => {
  const products = [{ _id: "product-1", title: "Lamp" }];
  const query = mockProductQuery(products);
  const response = createResponse();

  await listProducts(createRequest(), response);

  expect(productFind).toHaveBeenCalledWith({});
  expect(query.sort).toHaveBeenCalledWith({ category: 1, title: 1 });
  expect(query.limit).toHaveBeenCalledWith(100);
  expect(response.json).toHaveBeenCalledWith(products);
});

it("filters products by category", async () => {
  mockProductQuery([]);

  await listProducts(
    createRequest({ category: "Home" } as Request["query"]),
    createResponse(),
  );

  expect(productFind).toHaveBeenCalledWith({ category: "Home" });
});

it("trims search text and uses a case-insensitive title filter", async () => {
  mockProductQuery([]);

  await listProducts(
    createRequest({ q: " lamp " } as Request["query"]),
    createResponse(),
  );

  expect(productFind).toHaveBeenCalledWith({
    title: { $regex: "lamp", $options: "i" },
  });
});

it("applies category and title search together", async () => {
  mockProductQuery([]);

  await listProducts(
    createRequest(
      { category: "Home", q: "lamp" } as Request["query"],
    ),
    createResponse(),
  );

  expect(productFind).toHaveBeenCalledWith({
    category: "Home",
    title: { $regex: "lamp", $options: "i" },
  });
});

it("limits search text to 100 characters", async () => {
  mockProductQuery([]);
  const search = "x".repeat(150);

  await listProducts(
    createRequest({ q: search } as Request["query"]),
    createResponse(),
  );

  expect(productFind).toHaveBeenCalledWith({
    title: { $regex: "x".repeat(100), $options: "i" },
  });
});

it("returns distinct product categories", async () => {
  const categories = ["Home", "Jewellery"];
  productDistinct.mockResolvedValue(categories as never);
  const response = createResponse();

  await listCategories(createRequest(), response);

  expect(productDistinct).toHaveBeenCalledWith("category");
  expect(response.json).toHaveBeenCalledWith(categories);
});

it("returns a product for an existing ID", async () => {
  const product = { _id: "507f1f77bcf86cd799439011", title: "Lamp" };
  const lean = jest.fn().mockResolvedValue(product);
  productFindById.mockReturnValue({ lean } as never);
  const response = createResponse();

  await getProduct(
    createRequest({}, "507f1f77bcf86cd799439011"),
    response,
  );

  expect(productFindById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
  expect(response.json).toHaveBeenCalledWith(product);
});

it("returns 404 when the requested product does not exist", async () => {
  const lean = jest.fn().mockResolvedValue(null);
  productFindById.mockReturnValue({ lean } as never);
  const response = createResponse();

  await getProduct(createRequest({}, "missing-id"), response);

  expect(response.status).toHaveBeenCalledWith(404);
  expect(response.json).toHaveBeenCalledWith({
    message: "Product not found",
  });
});

it("passes database errors to the Express error handler", async () => {
  const error = new Error("Database unavailable");
  const query = {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockRejectedValue(error),
  };
  productFind.mockReturnValue(query as never);
  const request = createRequest();
  const response = createResponse();
  const log = jest.spyOn(console, "error").mockImplementation(() => {});

  try {
    const forwardedError = new Promise<unknown>((resolve) => {
      const next = ((received: unknown) => resolve(received)) as NextFunction;
      asyncHandler(listProducts)(request, response, next);
    });

    await expect(forwardedError).resolves.toBe(error);
    errorHandler(error, request, response, jest.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) }),
    );
  } finally {
    log.mockRestore();
  }
});
