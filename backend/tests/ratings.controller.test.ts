import type { Response } from "express";
import { Product, Rating } from "../src/models/index.js";
import type { AuthRequest } from "../src/middleware/auth.js";
import {
  getMyRatings,
  getMyTopRated,
  saveRating,
} from "../src/modules/ratings/ratings.controller.js";

jest.mock("../src/models/index.js", () => ({
  Product: {
    findById: jest.fn(),
    updateOne: jest.fn(),
  },
  Rating: {
    find: jest.fn(),
    aggregate: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

const productFindById = jest.mocked(Product.findById);
const productUpdateOne = jest.mocked(Product.updateOne);
const ratingFind = jest.mocked(Rating.find);
const ratingAggregate = jest.mocked(Rating.aggregate);
const ratingFindOneAndUpdate = jest.mocked(Rating.findOneAndUpdate);

function createRequest(
  options: {
    userId?: string;
    id?: string;
    rating?: unknown;
  } = {},
) {
  return {
    userId: options.userId ?? "user-1",
    params: { id: options.id ?? "product-1" },
    body: { rating: options.rating },
  } as AuthRequest;
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

beforeEach(() => {
  jest.clearAllMocks();
});

it("returns the current user's rated products sorted by rating and update time", async () => {
  const product = { _id: "product-1", title: "Lamp" };
  const rows = [
    { product, rating: 5 },
    { product: null, rating: 4 },
  ];
  const query = {
    populate: jest.fn(),
    sort: jest.fn(),
    lean: jest.fn().mockResolvedValue(rows),
  };
  query.populate.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  ratingFind.mockReturnValue(query as never);
  const response = createResponse();

  await getMyTopRated(createRequest(), response);

  expect(ratingFind).toHaveBeenCalledWith({ user: "user-1" });
  expect(query.populate).toHaveBeenCalledWith("product");
  expect(query.sort).toHaveBeenCalledWith({ rating: -1, updatedAt: -1 });
  expect(response.json).toHaveBeenCalledWith([{ product, rating: 5 }]);
});

it("returns all ratings for the current user", async () => {
  const ratings = [{ product: "product-1", rating: 4 }];
  const lean = jest.fn().mockResolvedValue(ratings);
  ratingFind.mockReturnValue({ lean } as never);
  const response = createResponse();

  await getMyRatings(createRequest(), response);

  expect(ratingFind).toHaveBeenCalledWith({ user: "user-1" });
  expect(response.json).toHaveBeenCalledWith(ratings);
});

it.each([undefined, 0, 5.5, 6, "not-a-number"])(
  "rejects invalid rating value %s",
  async (rating) => {
    const response = createResponse();

    await saveRating(createRequest({ rating }), response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: "Rating must be an integer from 1 to 5",
    });
    expect(productFindById).not.toHaveBeenCalled();
    expect(ratingFindOneAndUpdate).not.toHaveBeenCalled();
  },
);

it("returns 404 when saving a rating for a missing product", async () => {
  productFindById.mockResolvedValue(null as never);
  const response = createResponse();

  await saveRating(createRequest({ rating: 4 }), response);

  expect(productFindById).toHaveBeenCalledWith("product-1");
  expect(response.status).toHaveBeenCalledWith(404);
  expect(response.json).toHaveBeenCalledWith({
    message: "Product not found",
  });
  expect(ratingFindOneAndUpdate).not.toHaveBeenCalled();
});

it("upserts the user's rating for an existing product", async () => {
  const product = { id: "product-1", _id: "product-1" };
  productFindById.mockResolvedValue(product as never);
  ratingFindOneAndUpdate.mockResolvedValue({} as never);
  ratingAggregate.mockResolvedValue([{ averageRating: 4 }] as never);
  productUpdateOne.mockResolvedValue({} as never);
  const response = createResponse();

  await saveRating(createRequest({ rating: 5 }), response);

  expect(ratingFindOneAndUpdate).toHaveBeenCalledWith(
    { user: "user-1", product: "product-1" },
    { rating: 5 },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  expect(ratingAggregate).toHaveBeenCalledWith([
    { $match: { product: "product-1" } },
    { $group: { _id: null, averageRating: { $avg: "$rating" } } },
  ]);
  expect(productUpdateOne).toHaveBeenCalledWith(
    { _id: "product-1" },
    { $set: { averageRating: 4 } },
  );
  expect(response.json).toHaveBeenCalledWith({
    message: "Your rating was saved",
    rating: 5,
  });
});
