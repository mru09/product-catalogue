import type { Product } from "../types";
import ProductCard from "./ProductCard";
import "./ProductGrid.css";

interface ProductGridProps {
  products: Product[];
  ratingsByProductId?: ReadonlyMap<string, number>;
}

export default function ProductGrid({ products, ratingsByProductId }: ProductGridProps) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          rating={ratingsByProductId?.get(product._id)}
        />
      ))}
    </div>
  );
}
