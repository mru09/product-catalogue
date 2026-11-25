import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="Product Catalogue home">
        <span className="brand-mark">F</span>
        <span>FORM &amp; FIND</span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/catalogue">Catalogue</NavLink>
        {user ? (
          <div className="account-controls">
            <span className="greeting">Hi, {user.name}</span>
            <button className="logout-button" type="button" onClick={logout}>Logout</button>
          </div>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </nav>
    </header>
  );
}
