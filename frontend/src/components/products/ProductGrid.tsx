import { Link } from "react-router-dom";
import type { Product } from "../../types";
export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid">
      {products.map((p) => (
        <Link className="product" to={`/products/${p._id}`} key={p._id}>
          <img
            src={p.image}
            alt={p.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
          <div className="pad">
            <small>{p.category}</small>
            <h3>{p.title}</h3>
            <b>₹{p.price}</b>
          </div>
        </Link>
      ))}
    </div>
  );
}
