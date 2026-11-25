import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import ProductGrid from "../components/ProductGrid";
import { api } from "../services/api";
import type { Product } from "../types";

type CategoriesState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; categories: string[] };

type ProductsState =
  | { key: string; status: "loading" }
  | { key: string; status: "error"; message: string }
  | { key: string; status: "ready"; products: Product[] };

export default function CataloguePage() {
  const [categoriesState, setCategoriesState] = useState<CategoriesState>({
    status: "loading"
  });
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [searchRevision, setSearchRevision] = useState(0);
  const requestKey = JSON.stringify([category, submitted, searchRevision]);
  const [productsState, setProductsState] = useState<ProductsState>({
    key: requestKey,
    status: "loading"
  });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    api<string[]>("/products/categories", { signal: controller.signal })
      .then((categories) => {
        if (active) setCategoriesState({ status: "ready", categories });
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        setCategoriesState({
          status: "error",
          message: error instanceof Error ? error.message : "Unable to load categories"
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== null) params.set("category", category);
    if (submitted) params.set("q", submitted);
    const path = `/products?${params.toString()}`;
    const controller = new AbortController();
    let active = true;
    setProductsState({ key: requestKey, status: "loading" });

    api<Product[]>(path, { signal: controller.signal })
      .then((products) => {
        if (active) setProductsState({ key: requestKey, status: "ready", products });
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        setProductsState({
          key: requestKey,
          status: "error",
          message: error instanceof Error ? error.message : "Unable to load products"
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [category, submitted, searchRevision, requestKey]);

  function submitSearch(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSubmitted(query.trim());
    setSearchRevision((revision) => revision + 1);
  }

  const uniqueCategories =
    categoriesState.status === "ready"
      ? Array.from(new Set(categoriesState.categories))
      : [];
  const currentProducts =
    productsState.key === requestKey ? productsState : { key: requestKey, status: "loading" as const };
  const heading = submitted
    ? `Results for “${submitted}”`
    : category ?? "All products";

  return (
    <section className="page-section catalogue-page">
      <div className="page-heading">
        <p className="eyebrow">CURATED FOR EVERYDAY</p>
        <h1>{heading}</h1>
      </div>

      <form className="catalogue-search" onSubmit={submitSearch} role="search">
        <label className="visually-hidden" htmlFor="catalogue-search">Search products</label>
        <input
          id="catalogue-search"
          type="search"
          placeholder="Search products..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="button button-primary" type="submit">Search</button>
      </form>

      <div className="category-tabs" aria-label="Product categories">
        <button
          className={category === null ? "active" : ""}
          type="button"
          aria-pressed={category === null}
          onClick={() => setCategory(null)}
        >
          All
        </button>
        {categoriesState.status === "loading" && (
          <span className="notice" role="status">Loading categories…</span>
        )}
        {categoriesState.status === "error" && (
          <span className="notice notice-error" role="alert">{categoriesState.message}</span>
        )}
        {uniqueCategories.map((item) => (
          <button
            className={category === item ? "active" : ""}
            type="button"
            aria-pressed={category === item}
            key={item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {currentProducts.status === "loading" && (
        <p className="notice" role="status">Loading products…</p>
      )}
      {currentProducts.status === "error" && (
        <p className="notice notice-error" role="alert">{currentProducts.message}</p>
      )}
      {currentProducts.status === "ready" && currentProducts.products.length === 0 && (
        <p className="notice" role="status">No matching products found.</p>
      )}
      {currentProducts.status === "ready" && currentProducts.products.length > 0 && (
        <ProductGrid products={currentProducts.products} />
      )}
    </section>
  );
}
