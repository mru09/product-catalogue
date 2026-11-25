import { useEffect, useState } from "react";
import ProductGrid from "../components/products/ProductGrid";
import { api } from "../services/api";
import type { Product } from "../types";
export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    api<string[]>("/products/categories")
      .then(setCategories)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (submitted) params.set("q", submitted);
    api<Product[]>(`/products?${params}`)
      .then(setProducts)
      .catch((e) => setError(e.message));
  }, [category, submitted]);
  const topRatedProducts = category
    ? products
        .filter((product) => (product.averageRating ?? 0) > 3)
        .sort(
          (left, right) =>
            (right.averageRating ?? 0) - (left.averageRating ?? 0) ||
            left.title.localeCompare(right.title),
        )
        .slice(0, 5)
    : [];
  const topRatedIds = new Set(topRatedProducts.map((product) => product._id));
  const additionalProducts = category
    ? products.filter((product) => !topRatedIds.has(product._id))
    : products;
  return (
    <section>
      <form
        className="search"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(query.trim());
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
        />
        <button>Search</button>
      </form>
      <div className="tabs">
        <button
          className={!category ? "active" : ""}
          onClick={() => setCategory("")}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            className={category === c ? "active" : ""}
            key={c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {error && <p>{error}</p>}
      {products.length ? (
        <>
          {topRatedProducts.length > 0 && (
            <section aria-labelledby="top-rated-category-heading">
              <h2 id="top-rated-category-heading">Top rated in {category}</h2>
              <ProductGrid products={topRatedProducts} />
            </section>
          )}
          {category && additionalProducts.length > 0 && (
            <h2>{topRatedProducts.length > 0 ? `More in ${category}` : `Products in ${category}`}</h2>
          )}
          <ProductGrid products={additionalProducts} />
        </>
      ) : (
        <p className="muted">No matching products found.</p>
      )}
    </section>
  );
}
