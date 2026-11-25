# Product Catalogue

Starter workspace layout for a React/TypeScript frontend and an Express/TypeScript backend. Application behavior is intentionally left as a scaffold.

## Requirements

- Node.js 20 LTS or newer
- npm
- MongoDB Community Server for future backend development

## Setup

```sh
npm install
Copy-Item backend/.env.example backend/.env
npm run dev
```

Set backend values in `backend/.env`; the example file contains development defaults. Frontend API configuration can be overridden with `VITE_API_URL` in `frontend/.env`.

## Workspace commands

- `npm run dev` — starts both workspace development commands.
- `npm run build` — builds backend and frontend workspaces.
- `npm run seed` — runs the backend seed entry point.
- `npm start` — starts the compiled backend entry point.

## Structure

- `backend/src/config`, `middleware`, `models`, `modules`, and `utils` — backend starter directories.
- `frontend/src/app`, `components`, `context`, `pages`, `services`, and `types` — frontend starter directories.
- `tests` — reserved for tests.

Backend dependencies include Express 4, Mongoose 8, TypeScript, `tsx`, CORS, dotenv, bcryptjs, jsonwebtoken, and Nodemailer. Frontend dependencies include React 18, React Router DOM 6, Vite 6, and TypeScript.

## Configuration and security

`backend/.env.example` documents backend environment variables; `frontend/.env.example` documents `VITE_API_URL`. Keep `.env`, secrets, credentials, `node_modules`, and compiled output out of source control. The supplied demo JWT value is for local development only. Add production secrets through the deployment environment and implement appropriate authentication, validation, logging, and operational security before deployment.
