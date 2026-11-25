# Decisions and assumptions

- Used the supplied API contracts, demo accounts, and category/product list as the source of truth. No original UI or product dataset was available in the initial checkout; seed descriptions and INR prices are now explicit in the seed data.
- Ratings are per-user. “Top rated by you” means that user's products ordered by their rating and most recent update; it is not an editorially curated list.
- Enquiry emails go to the specified sales inbox, with the customer's email set as `replyTo`. SMTP is optional for local setup, and enquiry submission reports an unavailable service until it is configured.
- Demo email/password authentication and direct SMTP sending are PoC choices. Production identity, queued/retried email, and operational security are deferred.
- Workspace boundaries, route modules/controllers, Mongoose models, shared frontend API/types, auth context, and reusable product grid keep new capabilities separate from app entry points.
- With another day:
1 Authentication and authorization: Replace demo login with secure authentication using JWT or session-based authentication, password hashing, token expiry and proper authorization.
2 Security and validation: Strengthen API validation, rate limiting, input sanitization, CORS configuration and centralized error handling.