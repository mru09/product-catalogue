import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { api } from "../services/api";
import type { Product } from "../types";
import CataloguePage from "./CataloguePage";

jest.mock("../services/api", () => ({
  api: jest.fn(),
}));

const categories = ["Jewellery", "Home"];
const products: Product[] = [
  {
    _id: "ring",
    title: "Silver Ring",
    description: "A silver ring",
    price: 25,
    category: "Jewellery",
    image: "/ring.jpg",
  },
  {
    _id: "lamp",
    title: "Desk Lamp",
    description: "A desk lamp",
    price: 40,
    category: "Home",
    image: "/lamp.jpg",
  },
];

const apiMock = jest.mocked(api);

function renderCatalogue() {
  return render(
    <MemoryRouter>
      <CataloguePage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  apiMock.mockReset();
  apiMock.mockImplementation((path: string) => {
    if (path === "/products/categories") {
      return Promise.resolve(categories);
    }
    if (path === "/products?category=Jewellery") {
      return Promise.resolve([products[0]]);
    }
    if (path === "/products?category=Home") {
      return Promise.resolve([products[1]]);
    }
    if (path === "/products?category=Home&q=lamp") {
      return Promise.resolve([products[1]]);
    }
    if (path === "/products?q=ring") {
      return Promise.resolve([products[0]]);
    }
    return Promise.resolve(products);
  });
});

it("loads categories and all products", async () => {
  renderCatalogue();

  expect(await screen.findByText("Silver Ring")).toBeInTheDocument();
  expect(screen.getByText("Desk Lamp")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Jewellery" })).toBeInTheDocument();
  expect(apiMock).toHaveBeenCalledWith("/products/categories");
  expect(apiMock).toHaveBeenCalledWith("/products?");
});

it("filters by category and marks it active", async () => {
  const user = userEvent.setup();
  renderCatalogue();

  await user.click(await screen.findByRole("button", { name: "Jewellery" }));

  expect(apiMock).toHaveBeenCalledWith("/products?category=Jewellery");
  expect(await screen.findByText("Silver Ring")).toBeInTheDocument();
  expect(screen.queryByText("Desk Lamp")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Jewellery" })).toHaveClass("active");
});

it("shows only products rated above three in the top-rated section", async () => {
  const user = userEvent.setup();
  const categoryProducts: Product[] = [
    { ...products[0], _id: "rated-low", title: "Rated Low", averageRating: 3.5 },
    { ...products[0], _id: "rated-three", title: "Rated Three", averageRating: 3 },
    { ...products[0], _id: "unrated", title: "Unrated", averageRating: 0 },
    { ...products[0], _id: "rated-high", title: "Rated High", averageRating: 4.8 },
  ];
  apiMock.mockImplementation((path: string) => {
    if (path === "/products/categories") return Promise.resolve(categories);
    if (path === "/products?category=Jewellery") {
      return Promise.resolve(categoryProducts);
    }
    return Promise.resolve(products);
  });

  renderCatalogue();
  await user.click(await screen.findByRole("button", { name: "Jewellery" }));

  expect(await screen.findByRole("heading", { name: "Top rated in Jewellery" })).toBeInTheDocument();
  const top = screen.getByRole("link", { name: /Rated High/ });
  const next = screen.getByRole("link", { name: /Rated Low/ });
  const atThreshold = screen.getByRole("link", { name: /Rated Three/ });
  const more = screen.getByRole("link", { name: /Unrated/ });
  expect(screen.getByRole("img", { name: "4.8 out of 5 stars" })).toBeInTheDocument();
  expect(screen.queryByRole("img", { name: "3.0 out of 5 stars" })).not.toBeInTheDocument();
  expect(top.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(next.compareDocumentPosition(atThreshold) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(atThreshold.compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.getByRole("heading", { name: "More in Jewellery" })).toBeInTheDocument();
});

it("submits a product search", async () => {
  const user = userEvent.setup();
  renderCatalogue();

  await user.type(
    screen.getByPlaceholderText("Search products..."),
    "ring",
  );
  await user.click(screen.getByRole("button", { name: "Search" }));

  expect(apiMock).toHaveBeenCalledWith("/products?q=ring");
  expect(await screen.findByText("Silver Ring")).toBeInTheDocument();
  expect(screen.queryByText("Desk Lamp")).not.toBeInTheDocument();
});

it("combines category and submitted search filters in the request", async () => {
  const user = userEvent.setup();
  renderCatalogue();

  await user.click(await screen.findByRole("button", { name: "Home" }));
  await user.type(
    screen.getByPlaceholderText("Search products..."),
    "lamp",
  );
  await user.click(screen.getByRole("button", { name: "Search" }));

  expect(apiMock).toHaveBeenCalledWith("/products?category=Home&q=lamp");
  expect(await screen.findByText("Desk Lamp")).toBeInTheDocument();
  expect(screen.queryByText("Silver Ring")).not.toBeInTheDocument();
});

it("restores all products when All is selected", async () => {
  const user = userEvent.setup();
  renderCatalogue();

  await user.click(await screen.findByRole("button", { name: "Jewellery" }));
  await user.click(screen.getByRole("button", { name: "All" }));

  expect(apiMock).toHaveBeenCalledWith("/products?");
  expect(await screen.findByText("Silver Ring")).toBeInTheDocument();
  expect(screen.getByText("Desk Lamp")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "All" })).toHaveClass("active");
});

it("shows the empty state when a search has no matches", async () => {
  const user = userEvent.setup();
  renderCatalogue();
  apiMock.mockImplementation((path: string) =>
    path === "/products/categories"
      ? Promise.resolve(categories)
      : path === "/products?"
        ? Promise.resolve(products)
        : Promise.resolve([]),
  );

  await user.type(
    screen.getByPlaceholderText("Search products..."),
    "unknown-product",
  );
  await user.click(screen.getByRole("button", { name: "Search" }));

  expect(await screen.findByText("No matching products found.")).toBeInTheDocument();
});

it("shows a category error without crashing when categories fail to load", async () => {
  apiMock.mockImplementation((path: string) =>
    path === "/products/categories"
      ? Promise.reject(new Error("Categories unavailable"))
      : Promise.resolve(products),
  );

  renderCatalogue();

  expect(await screen.findByText("Categories unavailable")).toBeInTheDocument();
  expect(screen.getByText("Silver Ring")).toBeInTheDocument();
});

it("shows a product error when the products request fails", async () => {
  apiMock.mockImplementation((path: string) =>
    path === "/products?"
      ? Promise.reject(new Error("Products unavailable"))
      : Promise.resolve(categories),
  );

  renderCatalogue();

  expect(await screen.findByText("Products unavailable")).toBeInTheDocument();
});

it("keeps the product list unchanged until the search is submitted", async () => {
  const user = userEvent.setup();
  renderCatalogue();
  await screen.findByText("Silver Ring");
  apiMock.mockClear();

  await user.type(screen.getByPlaceholderText("Search products..."), "ring");

  expect(screen.getByText("Silver Ring")).toBeInTheDocument();
  expect(screen.getByText("Desk Lamp")).toBeInTheDocument();
  expect(apiMock).not.toHaveBeenCalled();

  fireEvent.submit(screen.getByRole("button", { name: "Search" }).closest("form")!);

  expect(await screen.findByText("Silver Ring")).toBeInTheDocument();
  await waitFor(() => {
    expect(apiMock).toHaveBeenCalledWith("/products?q=ring");
  });
});
