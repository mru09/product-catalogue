# Frontend Specification 2: Authentication and Application Shell

## Scope

Implement the authentication context, persistent demo login, header account controls, and home page.

## Auth context

Provide:

- `user`: `User | null`
- `login(email, password): Promise<void>`
- `logout(): void`

Restore `user` from `localStorage.user` during initial state creation. Parse failure must return `null`.

`login`:

1. Call the login API.
2. Store `token` in `localStorage.token`.
3. Store the user JSON in `localStorage.user`.
4. Update context state.

`logout`:

1. Remove `token`.
2. Remove `user`.
3. Set context state to `null`.

Throw a clear context error if `useAuth` is used outside `AuthProvider`.

## Header

- Navigation links: Home and Catalogue.
- Mark the active router link.
- Logged out:
  - Show `Login`.
- Logged in:
  - Show `Hi, <name>`.
  - Show a logout button.
- Logout must update the header immediately.

## Login page

- Heading: `Demo login`.
- Email and password fields.
- Default values:
  - Email `mrunal@example.com`
  - Password `demo123`
- Email input and password input are required.
- Submit through auth context.
- Navigate to `/` on success.
- Display server or client errors in a visible message.
- Include both demo credentials on the page:
  - Mrunal: `mrunal@example.com / demo123`
  - Alex: `alex@example.com / demo123`

## Home page

Logged out:

- Display a login callout with heading `Make it personal`.
- Copy asks the user to log in to rate products and see personal top-rated picks.
- Link named `Demo login` to `/login`.

Logged in:

- Fetch `GET /api/me/top-rated`.
- Heading and eyebrow: `YOUR PERSONAL PICKS`, `Top rated by you`.
- Link `Rate more products →` to `/catalogue`.
- While loading, show no stale result from a previous user.
- Display API errors when retrieval fails.
- Empty state:
  - `You haven't rated any products yet. Browse the catalogue and rate products to build your personal list.`
- Rated state:
  - Show a compact star summary for each rated product.
  - Use filled and outline Unicode stars for the 1-to-5 rating.
  - Render rated products through the shared product grid.
- Refetch on auth user changes.
- Avoid state updates after the page effect is cleaned up.

## Acceptance

- Authentication survives reload when localStorage contains valid state.
- Logout removes both token and user.
- Logged-in state controls all account UI.
- Login success navigates home.
- Login failure remains on the login page and shows an error.
- Home switches cleanly between logged-out, loading/empty, and rated states.
