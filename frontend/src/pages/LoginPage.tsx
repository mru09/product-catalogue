import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await login(email, password);
      localStorage.setItem("token", result.token);
      navigate("/catalogue");
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="login-section">
      <div className="login-card">
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in</h1>
        <p className="login-help">Use a demo account to explore the catalogue.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && <p className="notice-error" role="alert">{error}</p>}
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
          {submitting && <p className="visually-hidden" role="status">Signing in</p>}
        </form>
        <p className="demo-hint">
          Demo: <code>mrunal@example.com</code> / <code>demo123</code>
        </p>
        <Link className="text-link" to="/catalogue">Continue browsing</Link>
      </div>
    </section>
  );
}
