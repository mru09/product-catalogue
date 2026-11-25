import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Product } from "../types";
import ProductCard from "../components/ProductCard";

type CatalogueState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; products: Product[] };

export default function CataloguePage() {
  const [state, setState] = useState<CatalogueState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    api<Product[]>("/products", { signal: controller.signal })
      .then((products) => setState({ status: "ready", products }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Unable to load products"
        });
      });
    return () => controller.abort();
  }, []);

  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="eyebrow">CURATED FOR EVERYDAY</p>
        <h1>Explore the catalogue</h1>
        <p>Thoughtful pieces for home, style, and the moments in between.</p>
      </div>
      {state.status === "loading" && <p className="notice" role="status">Loading products…</p>}
      {state.status === "error" && <p className="notice notice-error" role="alert">{state.message}</p>}
      {state.status === "ready" && state.products.length === 0 && (
        <p className="notice" role="status">No products are available yet.</p>
      )}
      {state.status === "ready" && state.products.length > 0 && (
        <div className="product-grid">
          {state.products.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      )}
    </section>
  );
}
