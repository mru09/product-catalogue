import { Link } from "react-router-dom";
import type { Product } from "../types";

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export default function ProductCard({
  product,
  rating
}: {
  product: Product;
  rating?: number;
}) {
  return (
    <article className="product-card">
      <Link className="product-card-image" to={`/products/${product._id}`}>
        <img src={product.image} alt={product.title} loading="lazy" />
      </Link>
      <div className="product-card-copy">
        <p className="product-category">{product.category}</p>
        <Link className="product-title" to={`/products/${product._id}`}>
          {product.title}
        </Link>
        {rating !== undefined && (
          <span className="product-rating" role="img" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => (
              <span aria-hidden="true" key={index}>{index < rating ? "★" : "☆"}</span>
            ))}
          </span>
        )}
        <p className="product-price">{priceFormatter.format(product.price)}</p>
      </div>
    </article>
  );
}
