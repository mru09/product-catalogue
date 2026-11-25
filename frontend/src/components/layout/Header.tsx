import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";
export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/catalogue">Catalogue</NavLink>
      </nav>
      <div className="account">
        {user ? (
          <>
            <span>Hi, {user.name}</span>
            <button className="secondary" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </header>
  );
}
