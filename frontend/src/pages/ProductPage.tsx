import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api, getToken } from "../services/api";
import type { Product, RatedProduct } from "../types";
import "./ProductPage.css";
export default function ProductPage() {
  const { id } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const [rating, setRating] = useState(0);
  const [msg, setMsg] = useState("");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryPending, setEnquiryPending] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");
  const [enquirySent, setEnquirySent] = useState(false);
  useEffect(() => {
    setRating(0);
    setMsg("");
    setEnquiryOpen(false);
    setEnquiryPending(false);
    setEnquiryError("");
    setEnquirySent(false);
    api<Product>(`/products/${id}`)
      .then(setP)
      .catch((e) => setMsg(e.message));
    if (getToken()) {
      api<RatedProduct[]>("/me/top-rated")
        .then((rows) => {
          const ratedProduct = rows.find((row) => row.product._id === id);
          if (ratedProduct) setRating(ratedProduct.rating);
        })
        .catch((e) => setMsg(e.message));
    }
  }, [id]);
  async function save() {
    if (!getToken()) {
      setMsg("Please log in to save your rating.");
      return;
    }
    if (rating === 0) {
      setMsg("Please select a rating.");
      return;
    }
    try {
      const d = await api<{ message: string }>(`/me/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({ rating }),
      });
      setMsg(d.message);
    } catch (e) {
      setMsg((e as Error).message);
    }
  }
  async function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!p || !id) return;
    const formData = new FormData(event.currentTarget);
    setEnquiryPending(true);
    setEnquiryError("");
    try {
      await api<{ message: string }>("/enquiries", {
        method: "POST",
        body: JSON.stringify({
          productId: id,
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
        }),
      });
      setEnquirySent(true);
    } catch (e) {
      setEnquiryError((e as Error).message);
    } finally {
      setEnquiryPending(false);
    }
  }
  if (!p) return <p>{msg || "Loading product..."}</p>;
  return (
    <section className="detail">
      <img src={p.image} alt={p.title} />
      <div>
        <small>{p.category}</small>
        <h1>{p.title}</h1>
        <h2>₹{p.price}</h2>
        <p>{p.description}</p>
        <button type="button" onClick={() => setEnquiryOpen((open) => !open)}>
          Enquire
        </button>
        {enquiryOpen &&
          (enquirySent ? (
            <p className="message" role="status">
              Thank you! Your enquiry has been sent.
            </p>
          ) : (
            <form className="enquiry-form" onSubmit={submitEnquiry}>
              <label htmlFor="enquiry-name">Name</label>
              <input
                id="enquiry-name"
                name="name"
                autoComplete="name"
                maxLength={100}
                required
              />
              <label htmlFor="enquiry-email">Email</label>
              <input
                id="enquiry-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
              />
              <label htmlFor="enquiry-phone">Phone</label>
              <input
                id="enquiry-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={40}
                required
              />
              <label htmlFor="enquiry-message">Message (optional)</label>
              <textarea
                id="enquiry-message"
                name="message"
                maxLength={2000}
                rows={4}
              />
              <button type="submit" disabled={enquiryPending}>
                {enquiryPending ? "Sending..." : "Submit enquiry"}
              </button>
              {enquiryError && (
                <p className="message" role="alert">
                  {enquiryError}
                </p>
              )}
            </form>
          ))}
        <label>Your rating</label>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              className={n <= rating ? "selected" : ""}
              key={n}
              onClick={() => setRating(n)}
            >
              ★
            </button>
          ))}
        </div>
        <button onClick={save}>Save my rating</button>
        {msg && <p className="message">{msg}</p>}
        <p>
          <Link to="/catalogue">← Back to catalogue</Link>
        </p>
      </div>
    </section>
  );
}
