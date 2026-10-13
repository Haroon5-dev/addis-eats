# Addis Eats data-fetching decisions

## Shared fetcher (`lib/fetcher.js`)
All SWR requests use one JSON fetcher. It parses the response, checks `response.ok`, and throws a useful error for non-2xx responses. A successful response with malformed JSON also throws, so SWR exposes failures through `error` instead of treating an invalid payload as successful data.

## Menu search (`app/menu/SearchBox.jsx`)
- **Debounce: 300 ms.** This is long enough to avoid a request for every keystroke while keeping search responsive.
- **Null key for an empty term.** The server already rendered the first page, so no redundant search request is needed until the user enters a term.
- **Query key:** `/api/dishes?search=<encoded term>&category=<encoded category>&page=<page>&limit=4`. Each term/category/page/size combination is a distinct cache entry; URL encoding prevents spaces and punctuation from corrupting the query string.
- **`keepPreviousData: true`.** Results remain visible while the next search request is pending, avoiding a blank flash between terms. The status line indicates refresh activity.
- **`dedupingInterval: 2000`.** Duplicate requests for the same key in a short burst are coalesced; this is suitable for a small read-only menu endpoint.
- **`revalidateOnFocus: false`.** The menu catalogue is relatively stable, and focusing the tab should not trigger distracting refreshes during typing. A new query still fetches its own result.
- The initial menu query is rendered by the Server Component from the local JSON catalogue and passed as SWR fallback data; the page has content before hydration and a failed refresh can retain that content.
- Category, search, and page selections are reflected in `/menu` query parameters, so filters can be linked or refreshed.
- With no search term, category and pagination are served from the server-rendered JSON query and no browser fetch occurs; category links are normal navigations and pagination/search updates use the router.

## Order status (`app/orders/[id]/OrderStatusPoller.jsx`)
- **Key:** `/api/orders/<encoded order id>`; the ID identifies one order resource.
- **`fallbackData`:** the server-rendered order provides immediate status and item details before the first browser request completes.
- **`refreshInterval`: 5000 ms while pending, 0 otherwise.** Five seconds provides visible progress without excessive polling. Polling stops once the order is no longer pending.
- **`dedupingInterval: 1000`.** Avoids duplicate requests close together while keeping the status fresh.
- **`revalidateOnFocus: true`.** A returning customer gets a fresh status when switching back to the tracking tab.
- **`keepPreviousData: true`.** The last known status stays on screen during revalidation or a transient request failure.
- The order API verifies session ownership and returns `404` for missing or foreign orders. The current in-memory order store is development/demo persistence only; restarting the server clears orders.

## Pagination and API
`GET /api/dishes` accepts `search`, `category`, `page`, and `limit`. The server filters by category and text first, clamps page and limit, then slices results and returns pagination metadata. The default page size is 4 and the maximum is 12 to keep responses bounded. Responses use `Cache-Control: no-store` because the route currently represents demo menu data and there is no shared cache invalidation strategy.

## Favorites (`app/favorites/favoritesStore.js`)

Favorites are persisted under the browser localStorage key `addis-eats-favorites`; no API query is made. This keeps the feature usable without a server account but does not sync favorites across browsers or devices. The page displays a hydration state before showing the browser-persisted result or empty state.

## Order history (`app/orders/page.js`)

The server reads the signed-in session and calls `getOrdersForOwner(userId)` against the process-local order map. The page is `force-dynamic`, has no shared cache, and never accepts an owner ID from a browser query parameter. Its empty state means there are no orders owned by the active session in this process. Records are lost when the server process restarts and are not shared between multiple application instances.

## Cart and reorder

Cart items persist through Zustand localStorage under `addis-eats-cart`; the browser calculates the display subtotal from the stored items. Checkout Server Actions ignore submitted prices and names and recalculate against `public/dishes.json`. Reorder copies prior server-owned line items into the local cart store; checkout again resolves current catalogue prices before saving.
