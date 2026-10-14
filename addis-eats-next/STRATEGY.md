# Addis Eats route strategy

## Existing architecture

The project uses the Next.js 16 App Router, JavaScript, React Server Components, Route Handlers, Server Actions, Tailwind CSS 4, Zustand, Zod, and SWR. Menu seed data and photography are local files under `public/`; staff edits and orders are persisted in ignored local JSON for single-machine development only. Signed sessions use HTTP-only cookies. Replace the local JSON data layer with a shared database before deployment.

The established visual theme is Addis Eats red (`#b5121b`), gold (`#f4c430`), and warm cream; route work should extend these tokens rather than introducing a replacement palette.

## Route decisions

| Route | Rendering and data | Protection | Loading, error, or empty behavior | Reason |
|---|---|---|---|---|
| `/` | Dynamic Server Component; local JSON menu catalogue | Public | Server-rendered specials and local hero image | Reflects changes made by staff in the local catalogue. |
| `/menu` | Async Server Component; local JSON catalogue for the initial category/page, SWR for debounced searches | Public | Initial server results, preserved results during revalidation, explicit empty/error text | Server rendering provides useful first paint while client requests are reserved for interactive search. |
| `/menu/[id]` | Dynamic Server Component; local JSON catalogue | Public | `notFound()` for unavailable or unknown IDs | Dish details reflect staff edits. |
| `/cart` | Client Component; Zustand persisted in browser storage | Public | Friendly empty-cart state | Cart interaction and persistence require browser state. |
| Theme control | Small Client Component in the server-rendered navigation; localStorage | Public | Light theme is the safe initial render, then the saved selection is applied | Theme persistence needs browser storage while the rest of the root layout remains server-rendered. |
| `/checkout` | Server page shell plus client form and Server Action | Customer session | Middleware redirect; field-level validation and action errors | The server must revalidate identity, prices, and order input. |
| `/orders/[id]` | Server Component seed plus SWR poller | Customer session and owner check | `notFound()` for unknown or foreign orders; seeded first paint | The server enforces privacy; the client only refreshes status. |
| `/favorites` | Client Component; Zustand/localStorage favorites | Public; browser-local | Hydration message and friendly empty state | Favorites are personal browser demo state and do not need server authorization. |
| `/orders` | Dynamic Server Component; owner-filtered local JSON order store | Customer session | Middleware redirect; owner-only order list and empty state | Order history must be filtered on the server and never sent across accounts. |
| `/signin` | Server page plus client sign-in form and Server Action | Public | Inline configuration/credential errors | Credentials and session creation must remain server-side. |
| `/api/dishes` | Route Handler; local JSON catalogue; no-store responses | Public | Structured paginated JSON | Search and pagination need a bounded, consistent API contract. |
| `/api/dishes/[id]` | Route Handler; local JSON catalogue | Public | 404 JSON for unknown IDs | Provides an explicit single-dish endpoint. |
| `/api/orders` | Route Handler; server validation and order store | Customer session for creation | Explicit validation/authentication errors | The browser must not control trusted prices, totals, or ownership. |
| `/api/orders/[id]` | Route Handler; owner-scoped read | Customer session plus order ownership | 404 for unknown or foreign orders | Avoids disclosing another customer's order existence or status. |
| `/admin` and `/admin/orders` | Dynamic Server Components and Server Actions; local JSON | Staff role | Addis Ababa seven-day charts, accessible chart data tables, URL-sorted pagination, safe order transitions, empty/loading/error states | Aggregation stays server-side; payment-unverified order totals are not presented as confirmed revenue. |
| `/admin/menu` | Dynamic Server Components and Server Actions; local JSON catalogue | Staff role | Create, edit, remove/archive, and availability controls | Staff changes are reflected in the customer menu and checkout. |
| `/admin/customers` | Dynamic Server Component; summaries derived from orders | Staff role | Empty state and order-derived summaries | No registered-customer database exists. |
| `/staff/kitchen` | Dynamic Server Component; local JSON order queue | Staff or kitchen role | Kitchen view with preparation status changes | Kitchen role is limited to preparation steps. |

## Data and rendering rules

- Keep stable menu content and route metadata on the server.
- Let the menu search client use the shared fetcher only for debounced, non-empty queries.
- Keep persisted cart state in Zustand and do not make the root layout a Client Component.
- Use Next.js `Image` for local food imagery, reserve image space, and prioritize only the home hero image.
- Use the existing system font stack; it avoids an external font request and does not require a build-time Google Fonts download.
- Treat local JSON orders and menu edits as development-only until a shared database is introduced.

## Current scope note

The customer homepage, dynamic local catalogue, menu filtering/pagination, favorites, and local JSON order history exist. Staff can manage orders and menu items and inspect order-derived customer summaries. Local JSON is not production storage; payment processing and registered customer accounts are not implemented.
