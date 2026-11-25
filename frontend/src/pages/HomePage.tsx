import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section className="home-hero">
      <p className="eyebrow">THE PRODUCT CATALOGUE</p>
      <h1>Considered finds<br />for everyday living.</h1>
      <p className="hero-copy">
        Discover useful, beautiful pieces for your home and everyday routine.
      </p>
      <Link className="button button-primary" to="/catalogue">
        Explore the catalogue
      </Link>
    </section>
  );
}
