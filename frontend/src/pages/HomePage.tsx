import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductGrid from "../components/products/ProductGrid";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { RatedProduct } from "../types";
export default function HomePage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<RatedProduct[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (user)
      api<RatedProduct[]>("/me/top-rated")
        .then((x) => {
          if (active) setRows(x);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    else setRows([]);
    return () => {
      active = false;
    };
  }, [user]);
  return (
    <>
      {user ? (
        <section>
          <div className="sectionhead">
            <div>
              <p className="eyebrow">YOUR PERSONAL PICKS</p>
              <h2>Top rated by you</h2>
            </div>
            <Link to="/catalogue">Rate more products →</Link>
          </div>
          {error ? (
            <p>{error}</p>
          ) : rows.length ? (
            <>
              <div className="rated">
                {rows.map((x) => (
                  <span key={x.product._id}>
                    {"★".repeat(x.rating)}
                    {"☆".repeat(5 - x.rating)} · {x.product.title}
                  </span>
                ))}
              </div>
              <ProductGrid products={rows.map((x) => x.product)} />
            </>
          ) : (
            <p className="muted">
              You haven’t rated any products yet. Browse the catalogue and rate
              products to build your personal list.
            </p>
          )}
        </section>
      ) : (
        <section className="login-callout">
          <h2>Make it personal</h2>
          <p>Log in to rate products and see your own top-rated picks here.</p>
          <Link className="button" to="/login">
            Demo login
          </Link>
        </section>
      )}
    </>
  );
}
