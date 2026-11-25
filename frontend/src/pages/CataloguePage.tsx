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
      <h2>
        {submitted ? `Results for “${submitted}”` : category || "All products"}
      </h2>
      {error && <p>{error}</p>}
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <p className="muted">No matching products found.</p>
      )}
    </section>
  );
}
