# Addis Eats authentication

## What is protected

- `/checkout`, `/orders`, and `/orders/:id` require a valid signed-in session. Middleware gates these paths, and the order-history page/status handler independently reads the session and filters/checks order ownership on the server.
- `/staff/kitchen` requires the `staff` or `kitchen` role. The role is checked in middleware and again in the server-rendered page.
- Order creation and order lookup APIs independently require a session. An order can only be read or cancelled by its owning session.
- `GET /api/orders/:id` deliberately returns `404` for both missing and foreign orders to avoid disclosing another customer's order.
- `/orders` does not accept an owner ID from the query string; it retrieves orders for the verified session's user ID only.
- `/signin` accepts a local `next` destination only when it starts with one slash; protocol-relative and backslash-based destinations are rejected.

## Configure credentials

1. Copy `.env.example` to `.env.local`.
2. Set `AUTH_SECRET` to a unique random secret of at least 32 characters. Do not commit `.env.local`.
3. Configure `AUTH_EMAIL` / `AUTH_PASSWORD` for a customer, `STAFF_EMAIL` / `STAFF_PASSWORD` for staff, and `KITCHEN_EMAIL` / `KITCHEN_PASSWORD` for kitchen access. Use strong, separate credentials.
4. Set `NEXT_PUBLIC_SITE_URL` to the real public origin when deploying; use `http://localhost:3000` only for local development.
5. Restart the development server after changing environment variables.

This project uses environment-configured accounts to demonstrate authentication without a database. For a public production service, connect a user database, hash passwords with Argon2id or bcrypt, add rate limiting and audit logging, and use persistent order storage. The current order store is in-memory and is not suitable for multi-instance production deployment.

## Session security

The session is a signed HMAC-SHA256 token with an expiry, stored in an `HttpOnly`, `SameSite=Lax`, path-wide cookie. The cookie is `Secure` in production. The signature and expiry are verified in middleware and server-side helpers. Sign out clears the cookie.

## Sign-out

Submit a POST request to `/signout` to clear the session and return to `/signin`. The kitchen page includes a sign-out form.
