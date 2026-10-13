# Addis Eats route strategy

## Existing architecture

The project uses the Next.js 16 App Router, JavaScript, React Server Components, Route Handlers, Server Actions, Tailwind CSS 4, Zustand, Zod, and SWR. Menu seed data and the food photography are local files under `public/`. Signed sessions use HTTP-only cookies. Orders are held in a process-local store, so they are suitable for a single-process demo but not durable multi-instance production use.

The established visual theme is Addis Eats red (`#b5121b`), gold (`#f4c430`), and warm cream; route work should extend these tokens rather than introducing a replacement palette.

## Route decisions

| Route | Rendering and data | Protection | Loading, error, or empty behavior | Reason |
|---|---|---|---|---|
| `/` | Server Component; local menu seed data | Public | Server-rendered specials and a local hero image | Static content should render immediately and avoid client data requests. |
| `/menu` | Async Server Component; local seed data for the initial category/page, SWR for debounced searches | Public | Initial server results, preserved results during revalidation, explicit empty/error text | Server rendering provides useful first paint while client requests are reserved for interactive search. |
| `/menu/[id]` | Server Component; local seed data; static params | Public | `notFound()` for unknown IDs | Dish content is stable and benefits from server rendering and metadata. |
| `/cart` | Client Component; Zustand persisted in browser storage | Public | Friendly empty-cart state | Cart interaction and persistence require browser state. |
| Theme control | Small Client Component in the server-rendered navigation; localStorage | Public | Light theme is the safe initial render, then the saved selection is applied | Theme persistence needs browser storage while the rest of the root layout remains server-rendered. |
| `/checkout` | Server page shell plus client form and Server Action | Customer session | Middleware redirect; field-level validation and action errors | The server must revalidate identity, prices, and order input. |
| `/orders` | Not implemented yet | Customer session | To be added with owner-scoped query and empty state | Order history requires persistent or session-owned order data. |
| `/orders/[id]` | Server Component seed plus SWR poller | Customer session and owner check | `notFound()` for unknown or foreign orders; seeded first paint | The server enforces privacy; the client only refreshes status. |
| `/favorites` | Client Component; Zustand/localStorage favorites | Public; browser-local | Hydration message and friendly empty state | Favorites are personal browser demo state and do not need server authorization. |
| `/orders` | Dynamic Server Component; owner-filtered process-local order store | Customer session | Middleware redirect; owner-only order list and empty state | Order history must be filtered on the server and never sent across accounts. |
| `/signin` | Server page plus client sign-in form and Server Action | Public | Inline configuration/credential errors | Credentials and session creation must remain server-side. |
| `/staff/kitchen` | Server Component and server-side role check | Staff/kitchen session | Redirect to sign-in or forbidden page | Role authorization must not rely on hidden client controls. |
| `/api/dishes` | Route Handler; local JSON catalogue; no-store responses | Public | Structured paginated JSON | Search and pagination need a bounded, consistent API contract. |
| `/api/dishes/[id]` | Route Handler; local JSON catalogue | Public | 404 JSON for unknown IDs | Provides an explicit single-dish endpoint. |
| `/api/orders` | Route Handler; server validation and order store | Customer session for creation | Explicit validation/authentication errors | The browser must not control trusted prices, totals, or ownership. |
| `/api/orders/[id]` | Route Handler; owner-scoped read | Customer session plus order ownership | 404 for unknown or foreign orders | Avoids disclosing another customer's order existence or status. |
| Admin routes | Not implemented yet | Staff/admin role | To be added only with server-side authorization | A hidden link is not an authorization boundary. |

## Data and rendering rules

- Keep stable menu content and route metadata on the server.
- Let the menu search client use the shared fetcher only for debounced, non-empty queries.
- Keep persisted cart state in Zustand and do not make the root layout a Client Component.
- Use Next.js `Image` for local food imagery, reserve image space, and prioritize only the home hero image.
- Use the existing system font stack; it avoids an external font request and does not require a build-time Google Fonts download.
- Treat process-local orders as a demo limitation until a durable database is introduced.

## Current scope note

The customer homepage, menu filtering/pagination, local image loading, favorites, and process-local order history exist. The optional admin route family is absent and is not implemented; the demo order store is not durable.
