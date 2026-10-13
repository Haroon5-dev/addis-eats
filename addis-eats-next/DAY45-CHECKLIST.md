# Day 45 Advanced Project — acceptance checklist

This checklist follows the uploaded `CodeOps_M3_D45_NextJS_Advanced_Project` brief. Do not mark items complete until verified on the deployed build.

## Six required areas

- [ ] **Accounts:** sign-in and sign-out work end-to-end; cookie is HttpOnly, SameSite, expiry set, Secure in production.
- [ ] **Protection:** middleware, server page checks, and every write action check access independently.
- [ ] **Ownership:** every private order read/write derives the owner from the verified session, never from a submitted owner ID.
- [ ] **Live data:** order status is server-seeded and polls while pending; menu search is debounced and paginated.
- [ ] **Performance:** record a Lighthouse baseline after features are complete, optimise, then record a comparable second run.
- [ ] **Discovery:** route metadata, social previews, JSON-LD, sitemap and robots.txt exist and are verified from deployed source.

## Route access matrix

| Route | Access | Required proof |
|---|---|---|
| `/` | Public | Server-rendered landing page |
| `/menu` and `/menu/:id` | Public | Server-rendered menu and dish detail |
| `/cart` | Public client-side cart | Cart stays in browser state |
| `/checkout` | Signed-in customer | Middleware + page/server action session check |
| `/orders/:id` | Owning customer only | Middleware + page session check + owner-scoped lookup |
| `/staff/kitchen` | Staff/kitchen role | Middleware + server page role check |
| `/api/orders/:id` | Owning customer only | Session and ownership checked in handler |
| `/api/dishes` | Public | Search and pagination query validation |

## Required adversarial tests

1. Signed out: submit an order/cancellation action; it must return a controlled unauthenticated result, not mutate data.
2. Signed in as customer A: request customer B's order ID in the URL and API; return not found/denied without disclosing B's data.
3. Open `/signin?next=https://example.com`; after sign-in, remain on the local safe destination or `/`, never the external site.
4. Tamper with submitted dish prices/totals; the server must recalculate using the trusted dish catalogue.
5. Try `/staff/kitchen` as a customer; server-side role validation must refuse access.

## Data fetching evidence

- Menu and dish detail: server-rendered from `public/dishes.json`.
- Search: client request only after a 300 ms pause; query key contains encoded search, page and limit; empty query does not fire a redundant request.
- Order status: server-rendered `fallbackData`, then SWR polls every five seconds only while status is pending.
- Cart: client store only; never treat cart prices as authoritative.

## Performance budget from the brief

| Metric | Target | Before | After |
|---|---:|---:|---:|
| LCP, throttled | Under 2.5 s | Not measured | Not measured |
| CLS | Under 0.1 | Not measured | Not measured |
| First Load JS, `/menu` | Under 120 kB | Not measured | Not measured |
| Largest image | Under 150 kB | Not measured | Not measured |
| Lighthouse performance | 90 or better | Not measured | Not measured |

Do not invent measurements. Run the production build and Lighthouse under the same device/throttling settings, then fill both columns and explain which changes caused the differences.

## Production verification

From a fresh clone:

```bash
npm install
# Copy .env.example to .env.local and configure secrets
npm run build
npm run start
```

Then verify `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/menu/1/opengraph-image`, view-source metadata, JSON-LD, the three security tests above, and the Network tab while typing into menu search.

## Known demo limitations

The account list is environment-configured rather than database-backed, and orders are stored in memory. This is suitable for a local teaching demonstration only: process restarts clear orders and multi-instance deployment will not share the same store. A real production service needs persistent storage, password hashing, rate limiting, and an appropriate identity system.
