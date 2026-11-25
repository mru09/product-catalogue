# Backend Specification 2: Authentication

## Scope

Implement demo email/password login and Bearer-token authentication for protected `/api/me` routes.

## Login endpoint

- Route: `POST /api/auth/login`
- Request body:

```json
{
  "email": "mrunal@example.com",
  "password": "demo123"
}
```

## Validation

- Convert email to a string, trim it, and lower-case it.
- Convert password to a string.
- Return HTTP `400` `{ "message": "Email and password are required" }` when either value is empty.
- Find the user by normalized email.
- Compare the submitted password with `passwordHash` using bcrypt.
- Invalid credentials return HTTP `401` `{ "message": "Invalid email or password" }`.

## Successful login

- Sign a 7-day JWT.
- Include `userId` as the authenticated user identifier.
- Sign with `JWT_SECRET`.
- Return:

```json
{
  "token": "<jwt>",
  "user": {
    "id": "<mongodb-user-id>",
    "name": "<name>",
    "email": "<normalized email>"
  }
}
```

## Authentication middleware

- Inspect `Authorization: Bearer <token>`.
- Missing or malformed Bearer credentials return HTTP `401` `{ "message": "Please log in" }`.
- Verify the JWT with `JWT_SECRET`.
- Require a string `userId` payload.
- Set `req.userId` and continue.
- Invalid or expired tokens return HTTP `401` `{ "message": "Session expired. Please log in again." }`.

## Security constraints

- Do not store plaintext passwords.
- Do not return password hashes.
- Keep the demo nature explicit in documentation.
- Require replacement with a production identity provider before public deployment.
- CORS, JWT expiry, HTTPS, rate limiting, and stronger validation remain production hardening requirements.

## Acceptance

- Seeded users can log in with `demo123`.
- Unknown users fail login.
- Wrong passwords fail login.
- Missing email or password is rejected.
- Protected routes accept a valid token.
- Missing, malformed, expired, or invalid JWTs are rejected.
