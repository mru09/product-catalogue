import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { RatedProduct, User } from "../types";
import ProductGrid from "../components/ProductGrid";

type PicksState =
  | { user: User; status: "loading" }
  | { user: User; status: "error"; message: string }
  | { user: User; status: "ready"; ratedProducts: RatedProduct[] };

export default function HomePage() {
  const { user } = useAuth();
  const [picks, setPicks] = useState<PicksState | null>(null);

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();
    let active = true;
    setPicks({ user, status: "loading" });
    api<RatedProduct[]>("/me/top-rated", { signal: controller.signal })
      .then((ratedProducts) => {
        if (active) setPicks({ user, status: "ready", ratedProducts });
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        setPicks({
          user,
          status: "error",
          message: error instanceof Error ? error.message : "Unable to load your top-rated picks"
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [user]);

  if (!user) {
    return (
      <section className="personal-callout">
        <p className="eyebrow">PERSONAL PICKS</p>
        <h1>Make it personal</h1>
        <p>Log in to rate products and see your personal top-rated picks.</p>
        <Link className="button button-primary" to="/login">Demo login</Link>
      </section>
    );
  }

  const currentPicks = picks?.user === user ? picks : null;
  if (!currentPicks || currentPicks.status === "loading") {
    return <p className="notice picks-loading" role="status">Loading your personal picks…</p>;
  }

  if (currentPicks.status === "error") {
    return (
      <section className="page-section">
        <p className="eyebrow">YOUR PERSONAL PICKS</p>
        <h1>Top rated by you</h1>
        <p className="notice notice-error" role="alert">{currentPicks.message}</p>
        <Link className="text-link" to="/catalogue">Rate more products →</Link>
      </section>
    );
  }

  const ratingsByProductId = new Map(
    currentPicks.ratedProducts.map(({ product, rating }) => [product._id, rating] as const)
  );

  return (
    <section className="page-section personal-picks">
      <div className="page-heading">
        <p className="eyebrow">YOUR PERSONAL PICKS</p>
        <h1>Top rated by you</h1>
        <Link className="text-link" to="/catalogue">Rate more products →</Link>
      </div>
      {currentPicks.ratedProducts.length === 0 ? (
        <p className="notice">
          You haven&apos;t rated any products yet. Browse the catalogue and rate products to build your personal list.
        </p>
      ) : (
        <ProductGrid
          products={currentPicks.ratedProducts.map(({ product }) => product)}
          ratingsByProductId={ratingsByProductId}
        />
      )}
    </section>
  );
}
