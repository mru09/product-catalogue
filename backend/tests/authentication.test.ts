import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../src/models/index.js";
import { login } from "../src/modules/auth/auth.controller.js";
import { requireAuth } from "../src/middleware/auth.js";

jest.mock("../src/models/index.js", () => ({
  User: {
    findOne: jest.fn(),
  },
}));

jest.mock("../src/config/env.js", () => ({
  env: { jwtSecret: "test-secret" },
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    sign: jest.fn(),
    verify: jest.fn(),
  },
}));

const userFindOne = jest.mocked(User.findOne);
const bcryptCompare = jest.mocked(bcrypt.compare);
const jwtSign = jest.mocked(jwt.sign);
const jwtVerify = jest.mocked(jwt.verify);

const user = {
  id: "user-1",
  name: "Alex",
  email: "alex@example.com",
  passwordHash: "hashed-password",
};

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

function createLoginRequest(body: Record<string, unknown> = {}) {
  return { body } as Request;
}

function createAuthRequest(authorization?: string) {
  return {
    headers: authorization ? { authorization } : {},
    userId: undefined,
  } as unknown as Request & { userId?: string };
}

beforeEach(() => {
  jest.clearAllMocks();
  userFindOne.mockResolvedValue(user as never);
  bcryptCompare.mockResolvedValue(true as never);
  jwtSign.mockReturnValue("signed-token" as never);
  jwtVerify.mockReturnValue({ userId: user.id } as never);
});

it("rejects login when email or password is missing", async () => {
  const response = createResponse();

  await login(createLoginRequest(), response);

  expect(response.status).toHaveBeenCalledWith(400);
  expect(response.json).toHaveBeenCalledWith({
    message: "Email and password are required",
  });
  expect(userFindOne).not.toHaveBeenCalled();
});

it("rejects an unknown user with invalid credentials", async () => {
  userFindOne.mockResolvedValue(null as never);
  const response = createResponse();

  await login(
    createLoginRequest({ email: "unknown@example.com", password: "pass" }),
    response,
  );

  expect(response.status).toHaveBeenCalledWith(401);
  expect(response.json).toHaveBeenCalledWith({
    message: "Invalid email or password",
  });
  expect(bcryptCompare).not.toHaveBeenCalled();
});

it("rejects an incorrect password with invalid credentials", async () => {
  bcryptCompare.mockResolvedValue(false as never);
  const response = createResponse();

  await login(
    createLoginRequest({ email: user.email, password: "wrong-password" }),
    response,
  );

  expect(bcryptCompare).toHaveBeenCalledWith("wrong-password", user.passwordHash);
  expect(response.status).toHaveBeenCalledWith(401);
  expect(response.json).toHaveBeenCalledWith({
    message: "Invalid email or password",
  });
});

it("compares the password and returns a signed token with safe user data", async () => {
  const response = createResponse();

  await login(
    createLoginRequest({ email: user.email, password: "correct-password" }),
    response,
  );

  expect(bcryptCompare).toHaveBeenCalledWith(
    "correct-password",
    user.passwordHash,
  );
  expect(jwtSign).toHaveBeenCalledWith(
    { userId: user.id },
    expect.any(String),
    { expiresIn: "7d" },
  );
  expect(response.json).toHaveBeenCalledWith({
    token: "signed-token",
    user: { id: user.id, name: user.name, email: user.email },
  });
});

it("normalizes email before looking up the user", async () => {
  const response = createResponse();

  await login(
    createLoginRequest({
      email: "  Alex@Example.COM  ",
      password: "correct-password",
    }),
    response,
  );

  expect(userFindOne).toHaveBeenCalledWith({ email: "alex@example.com" });
});

it.each([undefined, "Basic dXNlcjpwYXNz"])(
  "rejects a missing or non-Bearer authorization header",
  (authorization) => {
    const request = createAuthRequest(authorization);
    const response = createResponse();
    const next = jest.fn() as NextFunction;

    requireAuth(request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: "Please log in" });
    expect(next).not.toHaveBeenCalled();
  },
);

it("rejects an invalid JWT with the session-expired message", () => {
  jwtVerify.mockImplementation(() => {
    throw new Error("Invalid token");
  });
  const request = createAuthRequest("Bearer invalid-token");
  const response = createResponse();
  const next = jest.fn() as NextFunction;

  requireAuth(request, response, next);

  expect(jwtVerify).toHaveBeenCalledWith("invalid-token", expect.any(String));
  expect(response.status).toHaveBeenCalledWith(401);
  expect(response.json).toHaveBeenCalledWith({
    message: "Session expired. Please log in again.",
  });
  expect(next).not.toHaveBeenCalled();
});

it("sets req.userId and continues for a valid JWT", () => {
  const request = createAuthRequest("Bearer valid-token");
  const response = createResponse();
  const next = jest.fn() as NextFunction;

  requireAuth(request, response, next);

  expect(request.userId).toBe(user.id);
  expect(next).toHaveBeenCalledTimes(1);
  expect(response.status).not.toHaveBeenCalled();
});

it("rejects a valid JWT that does not contain a user ID", () => {
  jwtVerify.mockReturnValue({ sub: user.id } as never);
  const request = createAuthRequest("Bearer token-without-user-id");
  const response = createResponse();
  const next = jest.fn() as NextFunction;

  requireAuth(request, response, next);

  expect(response.status).toHaveBeenCalledWith(401);
  expect(response.json).toHaveBeenCalledWith({
    message: "Session expired. Please log in again.",
  });
  expect(next).not.toHaveBeenCalled();
});
