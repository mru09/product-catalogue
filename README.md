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

## Backend

The Express application applies CORS restricted to `CLIENT_ORIGIN`, a 1 MB JSON body limit, and `GET /api/health` before mounting these route groups:

- `/api/auth`
- `/api/products`
- `/api/me`
- `/api/enquiries`

The routers are currently empty scaffolds. Unknown routes return `404` with `{ "message": "Route not found" }`. Errors are logged and return `500`; production responses hide the underlying error message.

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

See `backend/.env.example` for backend configuration. Rotate `JWT_SECRET` from its development default before production, keep it secret, and provide it through secure deployment configuration. SMTP variables are present for future email support. Do not commit `.env` files, credentials, `node_modules`, or compiled output. Authentication and feature route handlers are not implemented yet; add production-grade authentication, authorization, validation, CORS configuration, TLS, logging, and operational protections before deployment.
