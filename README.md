# Product Catalogue

React 18/Vite 6 frontend and Express 4/Mongoose 8 backend in an npm workspace.

## Requirements and local setup

- Node.js 20 LTS or newer and npm
- MongoDB Community Server, running locally or available via a URI

From the repository root:

```sh
npm install
npm run seed
npm run dev
```

Before seeding, create `backend/.env` and set `MONGODB_URI` if the default local database is not suitable. Backend configuration is loaded from `backend/.env`; supported variables and defaults:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | API port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/catalogue` | MongoDB connection |
| `JWT_SECRET` | `change-this-development-secret` | Signing key for demo login tokens |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed browser origin |
| `NODE_ENV` | `development` | Error response mode |
| `SMTP_HOST` | empty | SMTP server; required for enquiries |
| `SMTP_PORT` | `587` | SMTP server port |
| `SMTP_SECURE` | `false` | Use secure SMTP connection |
| `SMTP_USER` / `SMTP_PASS` | empty | SMTP credentials |
| `SMTP_FROM` | empty | Enquiry sender address |

Enquiry submission returns `503` until SMTP host, credentials, and sender are configured. The frontend defaults to `http://localhost:4000/api`; set `VITE_API_URL` in `frontend/.env` to override it (`frontend/.env.example` is provided).

`npm run dev` starts both services. Open <http://localhost:5173>; API health is at <http://localhost:4000/api/health>.

## Demo accounts and seed

Run `npm run seed` to upsert `mrunal@example.com` and `alex@example.com`, both with password `demo123`, and 120 products across 12 categories. User passwords are bcrypt-hashed. Products match on title and category; seeded descriptions and INR prices are defined in the seed data. Seeding sets average ratings to zero and does not delete user ratings.

## Routes

- `POST /api/auth/login` — demo login; returns a seven-day Bearer token.
- `GET /api/products`, `/api/products/categories`, `/api/products/:id` — public catalogue.
- `GET /api/me`, `/api/me/top-rated`, `PUT /api/me/products/:id` — authenticated ratings.
- `POST /api/enquiries` — public enquiry email; requires SMTP configuration.

The frontend routes are `/`, `/catalogue`, `/products/:id`, and `/login`.

## Build and tests

```sh
npm run build
npm start
npm test --workspace backend
npm test --workspace frontend
```

`npm start` serves the compiled backend from `backend/dist`; configure the same backend environment first. Tests run via Jest in each workspace.

## Production notes

Demo credentials and the default JWT secret are public development values. Rotate and protect `JWT_SECRET`; replace demo authentication with a production identity provider before public deployment. Configure HTTPS, rate limiting, production CORS, SMTP, monitoring, and secure database access. Do not commit `.env` files, secrets, or compiled output.
