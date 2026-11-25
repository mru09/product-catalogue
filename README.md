# Product Catalogue

React/TypeScript frontend and Express/TypeScript/MongoDB backend workspace.

## Requirements and setup

Requires Node.js 20 LTS or newer, npm, and an available MongoDB instance.

```sh
npm install
Copy-Item backend/.env.example backend/.env
npm run seed
npm run dev
```

The backend reads `backend/.env`, connecting to `mongodb://127.0.0.1:27017/catalogue` by default. `frontend/.env.example` documents the frontend `VITE_API_URL` override.

## Frontend

The React application uses a shared header/layout and supports `/`, `/catalogue`, `/products/:id`, and `/login`. Unknown paths return to the home page. The API client uses `VITE_API_URL` (default `http://localhost:4000/api`), includes a stored `token` as a Bearer credential, and surfaces API error messages. The authentication context restores the stored user on reload; sign in with either seeded demo account to persist both user and token. Logged-in users see their personal top-rated products on the home page.

## Backend

The Express application applies CORS restricted to `CLIENT_ORIGIN`, a 1 MB JSON body limit, and `GET /api/health` before mounting these route groups:

- `/api/auth`
- `/api/products`
- `/api/me`
- `/api/enquiries`

`POST /api/auth/login` accepts an email and password and returns a seven-day Bearer JWT for a matching user. All `/api/me` routes require that token. Product catalogue and enquiry submission routes are public:

- `GET /api/products` — list products, optionally filtered by exact `category` and case-insensitive title query `q`.
- `GET /api/products/categories` — list distinct categories.
- `GET /api/products/:id` — get a product by MongoDB ID.
- `GET /api/me` — list the authenticated user's ratings.
- `GET /api/me/top-rated` — list rated products in rating/update order.
- `PUT /api/me/products/:id` — save or replace the authenticated user's rating.
- `POST /api/enquiries` — validate and email a product enquiry using configured SMTP.

Unknown routes return `404` with `{ "message": "Route not found" }`. Errors are logged and return `500`; production responses hide the underlying error message.

Login is demo email/password authentication only. Seeded demo accounts use `demo123`; passwords are bcrypt-hashed and hashes are never returned by login. Protected requests must send `Authorization: Bearer <token>`.

MongoDB must connect and schema indexes must initialize before the server listens. Product, User, and Rating Mongoose models are in `backend/src/models`.

## Seed data

Run `npm run seed` to upsert the demo users (`mrunal@example.com` and `alex@example.com`, password `demo123`) and 10 products in each of 12 categories (120 total). User passwords are hashed with bcrypt cost 10. Products are identified by both title and category, seeded with placeholder images and a zero average rating. Ratings are not deleted. The seeder prints category and insert/update counts and disconnects after success or failure.

This checkout did not contain the referenced source implementation or its description/price values, so the seed currently uses generated descriptions and deterministic placeholder INR prices.

## Commands

- `npm run dev` — run backend and frontend development servers concurrently.
- `npm run build` — build backend and frontend.
- `npm start` — start the compiled backend.
- `npm run seed` — seed MongoDB.

## Configuration and production security

See `backend/.env.example` for backend configuration. Rotate `JWT_SECRET` from its development default before production, keep it secret, and provide it through secure deployment configuration. Demo authentication must be replaced with a production identity provider before public deployment. HTTPS, rate limiting (especially for login and public enquiries), stronger input validation, and production CORS configuration are also required hardening. Configure SMTP credentials and `SMTP_FROM` to enable enquiry emails. Do not commit `.env` files, credentials, `node_modules`, or compiled output.
