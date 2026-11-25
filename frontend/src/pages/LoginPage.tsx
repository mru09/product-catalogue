import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function LoginPage() {
  const [email, setEmail] = useState("mrunal@example.com");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section className="login">
      <p className="eyebrow">WELCOME BACK</p>
      <h1>Demo login</h1>
      <form onSubmit={submit}>
        <label>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>Log in</button>
      </form>
      <p className="muted">
        Mrunal: mrunal@example.com / demo123
        <br />
        Alex: alex@example.com / demo123
      </p>
      {error && <p className="message">{error}</p>}
    </section>
  );
}
