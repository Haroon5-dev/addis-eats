# Addis Eats

A responsive food-ordering demo for Addis Ababa built with the Next.js App Router. It keeps the existing Addis Eats red, gold, and warm-neutral theme and uses the food photography already included in `public/images`.

## Features

- Image-led home page with local favorites and menu links.
- Local JSON menu with category filters, debounced search, URL-backed category/search/page state, and pagination.
- Dish details, add-to-cart controls, and browser-persisted cart/favorites.
- Persistent light/dark theme with the same red-and-gold brand accents.
- Checkout validated and repriced on the server.
- Signed-in customer order history, reorder, owner-checked order status, and pending-status polling.
- Server-side signed sessions and staff/kitchen route authorization.
- Responsive layout, keyboard focus indication, reduced-motion support, Next.js image optimization, sitemap, and robots metadata.

The demo's order store is in process memory; orders are not durable across restarts or synchronized between instances. Favorites/cart are local to the browser. This is not a production multi-user database.

## Stack

- Next.js 16 App Router, React 19, JavaScript
- Tailwind CSS 4, Zustand 5, SWR 2, Zod 4
- Local JSON seed data and `next/image`

## Folder structure

```text
app/                 App Router pages, Server Actions, API handlers, and UI
lib/                 Sessions, order store, shared fetcher, and validation
public/dishes.json   Demo menu seed data
public/images/       Local dish and hero photography
utils/               Currency formatter
```

## Prerequisites and setup

Use a Node.js version supported by the installed Next.js 16 release and npm.

```bash
npm install
Copy-Item .env.example .env.local
```

Set unique local credentials and a random 32+ character `AUTH_SECRET` in `.env.local`, then start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

`.env.example` documents required demo variables. `.env.local` is excluded by `.gitignore`; never commit actual credentials or session secrets. Configure at least `AUTH_SECRET`, `AUTH_EMAIL`, and `AUTH_PASSWORD`; optional staff and kitchen roles use their corresponding `STAFF_*` and `KITCHEN_*` variables. Set `NEXT_PUBLIC_SITE_URL` to the real origin only when deployed.

This demo compares configured credentials server-side; it is not a registration system or production identity provider. Use a proper identity provider and hashed credential storage before production deployment.

## Build and checks

```bash
npm run lint
npm run build
npm start
```

The server starts on `http://localhost:3000` unless configured otherwise. See `VERIFY.md` for manual API, authorization, malformed-input, and JavaScript-disabled checks.

## Routes and endpoints

| Route | Purpose |
|---|---|
| `/` | Home and today's local favorites |
| `/menu` | Searchable, categorized and paginated menu |
| `/menu/[id]` | Dish information |
| `/cart` | Browser-persisted cart |
| `/favorites` | Browser-persisted favorite dishes |
| `/checkout` | Protected checkout |
| `/orders` | Protected owner-specific history and reorder |
| `/orders/[id]` | Protected live status |
| `/signin` | Demo sign-in |
| `/staff/kitchen` | Staff/kitchen-only functionality |
| `/api/dishes` | Public dish search, category filter, pagination |
| `/api/dishes/[id]` | Public dish lookup |
| `/api/orders` | Validated, authenticated order creation |
| `/api/orders/[id]` | Owner-checked order status |

## Architecture and security documents

- `STRATEGY.md` — route and rendering decisions.
- `BOUNDARY.md` — state and server/client boundaries.
- `AUTH.md` — session, authorization, redirect, and cookie details.
- `DATA.md` — API, cache, query, and persistence behavior.
- `PERF.md` — image/font work and honestly reported measurements.

## Deployment

The application has **not been deployed**, so there is no deployment URL. For deployment, configure the environment variables in the hosting provider, use a durable shared database for orders, and replace demo credential authentication with a production identity system before handling real customer data.
