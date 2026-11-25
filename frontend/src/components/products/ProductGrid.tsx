import { Link } from "react-router-dom";
import { useState } from "react";
import type { Product } from "../../types";
import "./ProductGrid.css";
export default function ProductGrid({
  products,
  showRatings = false,
}: {
  products: Product[];
  showRatings?: boolean;
}) {
  const [failedImages, setFailedImages] = useState(() => new Set<string>());

  return (
    <div className="grid">
      {products.map((p) => (
        <Link className="product" to={`/products/${p._id}`} key={p._id}>
          <img
            src={p.image}
            alt={p.title}
            loading="lazy"
            className={failedImages.has(p._id) ? "image-hidden" : undefined}
            onError={() =>
              setFailedImages((current) => {
                const next = new Set(current);
                next.add(p._id);
                return next;
              })
            }
          />
          <div className="pad">
            <small>{p.category}</small>
            <h3>{p.title}</h3>
            {showRatings && p.averageRating !== undefined && (
              <p
                className="catalogue-rating"
                role="img"
                aria-label={`${p.averageRating.toFixed(1)} out of 5 stars`}
              >
                <span aria-hidden="true">
                  {"★".repeat(Math.round(p.averageRating))}
                  {"☆".repeat(5 - Math.round(p.averageRating))}
                </span>{" "}
                <span aria-hidden="true">{p.averageRating.toFixed(1)}</span>
              </p>
            )}
            <b>₹{p.price}</b>
          </div>
        </Link>
      ))}
    </div>
  );
}
