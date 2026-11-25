# Frontend Specification 1: Foundation and Routing

## Scope

Implement the Vite/React frontend shell, route structure, API client, shared types, and application entry point.

## Toolchain

- React 18
- React DOM 18
- React Router DOM 6
- TypeScript 5
- Vite 6
- React plugin
- Port `5173`

## Entry point

- Mount `<App />` in React StrictMode.
- Import the global stylesheet.
- Provide `index.html` with a `root` element.

## Shared types

```typescript
interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface RatedProduct {
  product: Product;
  rating: number;
}
```

## API client

- Base URL: `VITE_API_URL`, fallback `http://localhost:4000/api`.
- Read the JWT from `localStorage.token`.
- Merge `Content-Type: application/json`, optional Bearer authorization, and caller-provided headers.
- Send JSON with `fetch`.
- Parse a JSON response; fall back to `{ message: "Invalid server response" }` on JSON failure.
- Throw `Error(data.message || "Request failed")` for non-2xx responses.
- Implement a typed generic `api<T>()`.
- Implement `login(email, password)` as `POST /auth/login`.

## Routes

Render all routes beneath a shared layout:

- `/`: home page
- `/catalogue`: catalogue page
- `/products/:id`: product detail page
- `/login`: demo login page
- `*`: fallback home page

Use `BrowserRouter`, `Routes`, and `Route`.

## Layout

- Render `Header` above an `main` outlet region.
- Shared global CSS must cover desktop and mobile layouts.
- The application must not leave API or routing loading states without a visible status or message.

## Acceptance

- StrictMode renders without duplicate-router/session issues.
- API calls use the configured base URL.
- Stored JWTs are included in authorized API requests.
- API failures surface server messages.
- Direct navigation to supported routes works in a Vite SPA.
