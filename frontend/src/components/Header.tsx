import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Product Catalogue home">
        <span className="brand-mark">F</span>
        <span>FORM &amp; FIND</span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/catalogue">Catalogue</NavLink>
        <NavLink to="/login">Sign in</NavLink>
      </nav>
    </header>
  );
}
