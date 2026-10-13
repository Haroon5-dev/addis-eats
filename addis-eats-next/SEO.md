# Addis Eats SEO and share metadata

## Configuration
Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to the canonical public origin (for example, `https://your-domain.example`) before deployment. The localhost fallback is for development only.

## Implemented
- Root metadata base, title template, default title and description.
- Dish-specific title, description, canonical URL and Open Graph/Twitter metadata.
- JSON-LD `MenuItem` data generated from the same `public/dishes.json` record used to render each dish page.
- Site-wide Open Graph image at `/opengraph-image`.
- Generated 1200×630 per-dish social images at `/menu/[id]/opengraph-image`.
- Generated `/sitemap.xml` from actual dish records and public home/menu routes.
- Generated `/robots.txt` excludes cart, checkout, sign-in, orders, staff and API routes from crawling.

## Verify after deployment
Inspect deployed page source for canonical URL, metadata, JSON-LD and `og:image`. Open `/sitemap.xml`, `/robots.txt`, `/opengraph-image` and `/menu/1/opengraph-image`. Replace the sample site URL with the actual production origin. Sitemap entries are public routes only; robots.txt is crawler guidance, not access control.
