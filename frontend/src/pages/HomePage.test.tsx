import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { RatedProduct, User } from "../types";
import HomePage from "./HomePage";

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../services/api", () => ({
  api: jest.fn(),
}));

const user: User = { id: "user-1", name: "Alex", email: "alex@example.com" };
const ratedProducts: RatedProduct[] = [
  {
    product: {
      _id: "lamp-1",
      title: "Desk Lamp",
      description: "A desk lamp",
      price: 40,
      category: "Home",
      image: "/lamp.jpg",
    },
    rating: 5,
  },
];
const useAuthMock = jest.mocked(useAuth);
const apiMock = jest.mocked(api);

beforeEach(() => {
  useAuthMock.mockReset();
  useAuthMock.mockReturnValue({
    user,
    login: jest.fn(),
    logout: jest.fn(),
  });
  apiMock.mockReset();
});

it("shows the logged-in user's rated products", async () => {
  apiMock.mockResolvedValue(ratedProducts);

  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  expect(
    await screen.findByRole("heading", { name: "Desk Lamp" }),
  ).toBeInTheDocument();
  expect(apiMock).toHaveBeenCalledWith("/me/top-rated");
});

it("clears a previous request error and shows products after a successful refetch", async () => {
  apiMock
    .mockRejectedValueOnce(new Error("Session expired"))
    .mockResolvedValueOnce(ratedProducts);

  const { rerender } = render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  expect(await screen.findByText("Session expired")).toBeInTheDocument();

  useAuthMock.mockReturnValue({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  });
  rerender(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  useAuthMock.mockReturnValue({
    user,
    login: jest.fn(),
    logout: jest.fn(),
  });
  rerender(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  expect(
    await screen.findByRole("heading", { name: "Desk Lamp" }),
  ).toBeInTheDocument();
  await waitFor(() => {
    expect(apiMock).toHaveBeenCalledTimes(2);
  });
  expect(screen.queryByText("Session expired")).not.toBeInTheDocument();
});
