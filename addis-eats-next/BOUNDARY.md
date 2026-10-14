# Addis Eats component boundary map

## Rendering tree and ownership

| Component or module | Boundary | State owner / data source | Interaction | Boundary reasoning |
|---|---|---|---|---|
| `app/layout.js` | Server Component | Reads the session cookie; passes rendered children | Sign-out Server Action | Keeps session-aware navigation on the server without promoting the full app to a client bundle. |
| `app/ThemeToggle.jsx` | Client Component | Theme state synchronized with localStorage and the root HTML attribute | Toggles persistent light/dark presentation | Theme selection needs browser storage and a document-level theme attribute. |
| `app/page.js` | Dynamic Server Component | Local JSON dish catalogue | Links to menu/cart | The home hero and current specials render server-side. |
| `app/menu/page.js` | Async Server Component | Filters and paginates local JSON catalogue for the initial URL | Passes initial results to `SearchBox` | Server rendering supports a complete first paint and reflects staff edits. |
| `app/menu/layout.js` | Server Component | URL-based category navigation | Category links | Category changes are navigations and should remain shareable in the URL. |
| `app/menu/SearchBox.jsx` | Client Component | Local input state and SWR cache; API supplies searched result sets | Debounced search and pagination | Browser timing, SWR, and URL updates require a narrow client boundary. |
| `app/menu/DishesList.jsx` | Server-compatible component | Receives dish records | None | It only maps data and can render without browser APIs. |
| `app/menu/Dish.jsx` | Server Component | Receives one dish | Detail link | Card content is static; `next/image` optimizes local photography. |
| `app/menu/[id]/page.js` | Dynamic Server Component | Local JSON catalogue | None | Metadata, JSON-LD, image, and not-found behavior are server-owned and reflect staff edits. |
| `app/cart/page.js` | Client Component | Zustand persisted browser storage | Quantity changes, removal, checkout navigation | Cart state and controls are browser-interactive. |
| `app/cart/cartStore.js` | Client-side store | Zustand persistence/localStorage | Add, decrement, remove, clear | Persists cart state across refreshes on the current browser. |
| `app/cart/AddToCartButton.jsx` | Client Component | Cart Zustand store | Adds one dish and announces success | A server-rendered dish card needs a small interactive control without moving the card to the client. |
| `app/cart/CartNavLink.jsx` | Client Component | Cart Zustand store after hydration | Displays cart item count | The server-rendered navigation can show a hydration-safe browser-persisted badge. |
| `app/favorites/favoritesStore.js` | Client-side store | Zustand persistence/localStorage | Toggle and remove favorites | Favorites are demo-only state local to the browser. |
| `app/favorites/FavoriteButton.jsx` | Client Component | Favorites Zustand store | Toggle a dish favorite | Heart state must respond immediately and persist locally. |
| `app/favorites/page.jsx` | Client Component | Favorites Zustand store | Browse/remove saved dishes | The page data is browser-local rather than account-backed. |
| `app/checkout/page.js` | Server Component | Reads session via middleware and server helper | Renders form | Private route gating belongs on the server. |
| `app/checkout/CheckoutForm.jsx` | Client Component | Form and cart state; Server Action owns final validation | Submit, pending state, redirect | Native form interaction and cart serialization need client code, but trusted order creation stays server-side. |
| `app/actions.js` | Server Actions | Session helper, Zod schema, local catalogue, order store | Sign-in/out, create/cancel order | Mutations, secrets, prices, and ownership checks must not reach the browser. |
| `app/orders/[id]/page.js` | Server Component | Session plus owner-checked order store | Seeds status poller | Enforces access and supplies immediate private data. |
| `app/orders/[id]/OrderStatusPoller.jsx` | Client Component | SWR cache seeded from the server | Five-second polling while active | Polling is a browser lifecycle concern; server data prevents a loading flash. |
| `app/orders/page.js` | Dynamic Server Component | Session and server-filtered local JSON orders | Links to tracking and passes owned items to reorder | Private order history must be filtered before rendering. |
| `app/orders/ReorderButton.jsx` | Client Component | Cart Zustand store | Adds prior line items to cart | Reordering is a browser cart mutation. |
| `app/signin/page.js` | Server Component | Validates return destination and current session | Renders sign-in form | Redirect decisions and session reads belong on the server. |
| `app/signin/SignInForm.jsx` | Client Component | Server Action state | Sign-in submission and errors | Uses pending state without moving credential checks client-side. |
| `app/api/**/route.js` | Route Handler | Server catalogue, session, validation, and order store | JSON requests | HTTP endpoints are explicit trust and authorization boundaries. |
| `middleware.js` | Request interception | Signed session token and pathname | Redirects unauthenticated or unauthorized requests | Narrowly gates private route families; handlers still repeat authorization. |
| `app/admin/orders` | Dynamic Server Component and Server Action | Staff role and local JSON orders | Safe workflow transitions, history, and empty state | Mutations and role checks stay server-side. |
| `app/admin/menu` | Dynamic Server Components and Server Actions | Staff role and local JSON catalogue | Create, edit, availability, remove/archive | Changes flow through the public menu and checkout. |
| `app/admin/customers` | Dynamic Server Component | Staff role and order-derived summaries | Empty state and order summaries | There is no registered customer database. |
| `app/staff/kitchen` | Dynamic Server Component and Server Action | Staff/kitchen role and local JSON orders | Kitchen queue and preparation status transitions | Kitchen accounts can only advance preparation steps. |

## State and trust ownership

- Session state, credentials, catalogue prices, order totals, order ownership, and role checks are server-owned.
- Search text, SWR result cache, and cart interactions are client-owned.
- Cart persistence is browser-local demo state and is not an authenticated account cart.
- Theme selection is browser-local and retains the red/gold brand colors in both modes.
- Server Components may read cookies but do not modify them; sign-in and sign-out mutate cookies in Server Actions.
- Orders and catalogue edits use ignored local JSON files. They persist across local development restarts but are not shared between machines or suitable for production hosting.
- Favorites remain localStorage demo data; customer summaries are derived from order contacts rather than registered account profiles.
- Admin routes and Server Actions enforce staff/kitchen role boundaries on the server.

## Image and loading boundaries

Local image files are served from `public/images`. `next/image` reserves layout space for hero, menu, detail, and cart images; only the above-the-fold home hero is eager/priority, while menu and cart images remain lazy by default.
