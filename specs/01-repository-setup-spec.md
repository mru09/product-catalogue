# Repository Setup Specification

## Objective

Create a new repository containing a React/TypeScript frontend and an Express/TypeScript/MongoDB backend. The result must reproduce the  product-catalogue application and support local development, seeding, building, and startup.

## Repository layout

```text
catalogue/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── enquiries/
│   │   │   ├── products/
│   │   │   └── ratings/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── tests/
├── package.json
└── README.md
```

## Root setup

- Use Node.js 20 LTS or newer and npm.
- Configure the root package as a private npm workspace with `backend` and `frontend` members.
- Add `concurrently` as a root development dependency.
- Define these root scripts:
  - `dev`: run the backend and frontend development processes concurrently.
  - `build`: build the backend workspace, then the frontend workspace.
  - `seed`: run the backend seed command.
  - `start`: start the compiled backend.
- Do not commit `node_modules`, compiled output, `.env`, credentials, or private email configuration.
- Preserve an `.env.example` for backend configuration.

## Backend setup

- Use Node.js ESM (`"type": "module"`).
- Use Express 4, Mongoose 8, TypeScript 5, `tsx`, CORS, dotenv, bcryptjs, jsonwebtoken, and Nodemailer.
- Load configuration from `backend/.env`.
- Compile with the backend TypeScript configuration to `backend/dist`.
- Development command: `tsx watch src/server.ts`.
- Build command: `tsc -p tsconfig.json`.
- Start command: `node dist/server.js`.
- Seed command: `tsx src/seed.ts`.

## Frontend setup

- Use Vite 6, React 18, React Router DOM 6, and TypeScript 5.
- Development command: `vite --host 0.0.0.0`.
- Build command: `tsc -b && vite build`.
- Development port: `5173`.
- API URL default: `http://localhost:4000/api`.
- Support `VITE_API_URL` as the API base override.

## Environment variables

Backend:

```dotenv
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/catalogue
JWT_SECRET=change-this-development-secret
CLIENT_ORIGIN=http://localhost:5173
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
NODE_ENV=development
```

Frontend:

```dotenv
VITE_API_URL=http://localhost:4000/api
```

## Local execution

1. Start MongoDB Community Server locally.
2. Run `npm install` from the repository root.
3. Copy backend environment examples to `backend/.env` and configure SMTP only when email delivery is required.
4. Run `npm run seed`.
5. Run `npm run dev`.
6. Open `http://localhost:5173`.
7. Verify the API at `http://localhost:4000/api/health`.

## Seed requirements

- Connect to MongoDB using `MONGODB_URI`.
- Upsert the demo users with password `demo123`, using bcrypt.
- Reuse existing products by title and category and add missing products.
- Seed 12 categories and 10 products per category (120 products total).
- Categories: Jewellery, Home Decor, Accessories, Lighting, Kitchen, Furniture, Beauty, Fashion, Bags, Watches, Stationery, Outdoor.
- Generate placeholder images using `https://placehold.co/600x600?text=<encoded product title>`.
- Set `averageRating` to `0` for seeded products.
- Do not delete existing user ratings.
- Disconnect cleanly from Mongoose after success or failure.
- Print categories and inserted/updated product counts.

Demo accounts:

- `mrunal@example.com / demo123`
- `alex@example.com / demo123`

## README requirements

Document architecture, requirements, local setup, API routes, demo accounts, seed behavior, build/start commands, and production-hardening limitations.

## Production acceptance

- `npm install` succeeds from the repository root.
- `npm run seed` reaches MongoDB and seeds/upserts users and products.
- `npm run dev` starts both services.
- `npm run build` produces backend and frontend builds without errors.
- `npm start` serves the compiled backend.
- The seed and production configuration never require committed secrets.
