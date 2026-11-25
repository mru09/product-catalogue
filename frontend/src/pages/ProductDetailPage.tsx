import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { Product, RatedProduct } from "../types";

type ProductState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; product: Product };

type RatingMessage = { type: "error" | "success"; text: string };

interface EnquiryFields {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const emptyEnquiry: EnquiryFields = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function readToken(): string | null {
  return typeof localStorage === "undefined"
    ? null
    : localStorage.getItem("token");
}

export default function ProductDetailPage() {
  const { id } = useParams();
  return <ProductDetail key={id ?? "missing"} id={id} />;
}

function ProductDetail({ id }: { id?: string }) {
  const { user } = useAuth();
  const token = readToken();
  const ratingWasEdited = useRef(false);
  const [productState, setProductState] = useState<ProductState>({
    status: "loading",
  });
  const [rating, setRating] = useState(0);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingMessage, setRatingMessage] = useState<RatingMessage | null>(
    null,
  );
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryFields, setEnquiryFields] =
    useState<EnquiryFields>(emptyEnquiry);
  const [enquiryPending, setEnquiryPending] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");

  useEffect(() => {
    if (!id) {
      setProductState({ status: "error", message: "Product not found" });
      return;
    }

    const controller = new AbortController();
    let active = true;
    api<Product>(`/products/${encodeURIComponent(id)}`, {
      signal: controller.signal,
    })
      .then((product) => {
        if (active) setProductState({ status: "ready", product });
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        setProductState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Unable to load product",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id]);

  useEffect(() => {
    ratingWasEdited.current = false;
    setRating(0);
    setRatingMessage(null);
    if (!id || !token) return;

    const controller = new AbortController();
    let active = true;
    api<RatedProduct[]>("/me/top-rated", { signal: controller.signal })
      .then((ratedProducts) => {
        if (!active || ratingWasEdited.current) return;
        const existingRating = ratedProducts.find(
          (row) => row.product._id === id,
        );
        setRating(existingRating?.rating ?? 0);
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        setRatingMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Unable to load your rating",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [id, token, user]);

  async function saveRating(): Promise<void> {
    if (!token) {
      setRatingMessage({
        type: "error",
        text: "Please log in to save your rating.",
      });
      return;
    }
    if (!rating) {
      setRatingMessage({ type: "error", text: "Please select a rating." });
      return;
    }
    if (!id || productState.status !== "ready" || ratingSaving) return;

    setRatingSaving(true);
    setRatingMessage(null);
    try {
      const result = await api<{ message: string; rating: number }>(
        `/me/products/${encodeURIComponent(id)}`,
        { method: "PUT", body: JSON.stringify({ rating }) },
      );
      setRatingMessage({ type: "success", text: result.message });
    } catch (error: unknown) {
      setRatingMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Unable to save your rating",
      });
    } finally {
      setRatingSaving(false);
    }
  }

  async function submitEnquiry(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (!id || productState.status !== "ready" || enquiryPending) return;

    setEnquiryPending(true);
    setEnquiryError("");
    try {
      await api<{ message: string }>("/enquiries", {
        method: "POST",
        body: JSON.stringify({ productId: id, ...enquiryFields }),
      });
      setEnquirySent(true);
    } catch (error: unknown) {
      setEnquiryError(
        error instanceof Error ? error.message : "Unable to send your enquiry",
      );
    } finally {
      setEnquiryPending(false);
    }
  }

  if (productState.status === "loading") {
    return (
      <p className="notice" role="status">
        Loading product...
      </p>
    );
  }
  if (productState.status === "error") {
    return (
      <section className="page-section">
        <p className="notice notice-error" role="alert">
          {productState.message}
        </p>
        <Link className="text-link" to="/catalogue">
          ← Back to catalogue
        </Link>
      </section>
    );
  }

  const product = productState.product;

  return (
    <section className="product-detail">
      <Link className="text-link back-link" to="/catalogue">
        ← Back to catalogue
      </Link>
      <div className="detail-grid">
        <img className="detail-image" src={product.image} alt={product.title} />
        <div className="detail-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.title}</h1>
          <p className="detail-price">{priceFormatter.format(product.price)}</p>
          <p className="detail-description">{product.description}</p>

          <section className="rating-panel" aria-labelledby="rating-heading">
            <h2 id="rating-heading">Your rating</h2>
            <div
              className="rating-stars"
              role="group"
              aria-label="Rate this product"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  className={value <= rating ? "selected" : ""}
                  type="button"
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}
                  key={value}
                  onClick={() => {
                    ratingWasEdited.current = true;
                    setRating(value);
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <button
              className="button button-secondary"
              type="button"
              disabled={ratingSaving}
              onClick={() => void saveRating()}
            >
              {ratingSaving ? "Saving..." : "Save rating"}
            </button>
            {ratingMessage && (
              <p
                className={
                  ratingMessage.type === "error"
                    ? "notice notice-error"
                    : "notice"
                }
                role={ratingMessage.type === "error" ? "alert" : "status"}
              >
                {ratingMessage.text}
              </p>
            )}
          </section>

          <section className="enquiry-panel" aria-labelledby="enquiry-heading">
            <div className="enquiry-heading-row">
              <h2 id="enquiry-heading">Product enquiry</h2>
              <button
                className="button button-secondary"
                type="button"
                aria-expanded={enquiryOpen}
                aria-controls="enquiry-form-panel"
                onClick={() => setEnquiryOpen((open) => !open)}
              >
                Enquire
              </button>
            </div>
            {enquiryOpen && (
              <div id="enquiry-form-panel">
                {enquirySent ? (
                  <p className="notice" role="status">
                    Thank you! Your enquiry has been sent.
                  </p>
                ) : (
                  <form className="enquiry-form" onSubmit={submitEnquiry}>
                    <label htmlFor="enquiry-name">Name</label>
                    <input
                      id="enquiry-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      maxLength={100}
                      required
                      value={enquiryFields.name}
                      onChange={(event) =>
                        setEnquiryFields((fields) => ({
                          ...fields,
                          name: event.target.value,
                        }))
                      }
                    />
                    <label htmlFor="enquiry-email">Email</label>
                    <input
                      id="enquiry-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      required
                      value={enquiryFields.email}
                      onChange={(event) =>
                        setEnquiryFields((fields) => ({
                          ...fields,
                          email: event.target.value,
                        }))
                      }
                    />
                    <label htmlFor="enquiry-phone">Phone</label>
                    <input
                      id="enquiry-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={40}
                      required
                      value={enquiryFields.phone}
                      onChange={(event) =>
                        setEnquiryFields((fields) => ({
                          ...fields,
                          phone: event.target.value,
                        }))
                      }
                    />
                    <label htmlFor="enquiry-message">Message (optional)</label>
                    <textarea
                      id="enquiry-message"
                      name="message"
                      maxLength={2000}
                      rows={4}
                      value={enquiryFields.message}
                      onChange={(event) =>
                        setEnquiryFields((fields) => ({
                          ...fields,
                          message: event.target.value,
                        }))
                      }
                    />
                    {enquiryError && (
                      <p className="notice notice-error" role="alert">
                        {enquiryError}
                      </p>
                    )}
                    <button
                      className="button button-primary"
                      type="submit"
                      disabled={enquiryPending}
                    >
                      {enquiryPending ? "Sending..." : "Send enquiry"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
