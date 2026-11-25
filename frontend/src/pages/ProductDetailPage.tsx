import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import type { Product } from "../types";

type ProductState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; product: Product };

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export default function ProductDetailPage() {
  const { id } = useParams();
  const [state, setState] = useState<ProductState>({ status: "loading" });

  useEffect(() => {
    if (!id) {
      setState({ status: "error", message: "Product not found" });
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading" });
    api<Product>(`/products/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then((product) => setState({ status: "ready", product }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Unable to load product"
        });
      });
    return () => controller.abort();
  }, [id]);

  if (state.status === "loading") {
    return <p className="notice" role="status">Loading product…</p>;
  }
  if (state.status === "error") {
    return (
      <section className="page-section">
        <p className="notice notice-error" role="alert">{state.message}</p>
        <Link className="text-link" to="/catalogue">Back to catalogue</Link>
      </section>
    );
  }

  return (
    <section className="product-detail">
      <Link className="text-link back-link" to="/catalogue">← Back to catalogue</Link>
      <div className="detail-grid">
        <img className="detail-image" src={state.product.image} alt={state.product.title} />
        <div className="detail-copy">
          <p className="eyebrow">{state.product.category}</p>
          <h1>{state.product.title}</h1>
          <p className="detail-description">{state.product.description}</p>
          <p className="detail-price">{priceFormatter.format(state.product.price)}</p>
        </div>
      </div>
    </section>
  );
}
