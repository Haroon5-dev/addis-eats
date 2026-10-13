# Addis Eats performance notes

## Before / after measurement

No trustworthy before/after Lighthouse numbers are included: this editing session could not run the project build or browser Lighthouse in its available command environment. The VS Code task runner returned no build output, so the production build result is unverified rather than passed. No numeric improvement is claimed. Run a baseline from the parent revision and a post-change report under the same production-build, device, and throttling settings before recording measurements.

1. Run `npm run build`.
2. Run `npm run start`.
3. Open Chrome DevTools > Lighthouse.
4. Select **Navigation**, **Mobile**, and **Simulated throttling**. Run the report twice and compare the second run.
5. Record LCP, CLS, and INP (or Lighthouse's TBT as a lab proxy for responsiveness) below.

| Metric | Before | After |
|---|---:|---:|
| LCP | Not measured | Not measured |
| CLS | Not measured | Not measured |
| INP / lab proxy | Not measured | Not measured |
| Lighthouse performance score | Not measured | Not measured |
| Build route sizes | Not measured | Not measured |
| Production build | Unverified in this session | Unverified in this session |

## Changes made

- Replaced the text-only homepage with an image-led hero using the existing local `public/images/Mainhero.jpg`. It uses `next/image`, a fixed responsive container, `fill`, a responsive `sizes` value, and `priority` because it is the above-the-fold Largest Contentful Paint candidate.
- Added a small specials row backed by existing local dish images. These images have intrinsic dimensions and responsive `sizes`; they retain Next.js's default lazy loading because they are below the hero.
- Converted the remaining cart `<img>` to `next/image` with intrinsic dimensions and a narrow responsive `sizes` value. Dish cards and detail pages were already using `next/image`.
- Kept typography on a system font stack. The project did not import a remote `next/font/google` font; avoiding a new remote font request preserves its no-font-download behavior.
- Added visible keyboard focus styling and reduced-motion handling without changing the established red/gold/cream palette.
- Added a persistent light/dark toggle without adding a theme dependency; the saved choice applies to the root document and keeps the existing brand accents.
- The local food photos are not separately recompressed in this change. Next.js image optimization can produce responsive derivatives at runtime; image source byte sizes and actual delivered formats still need measurement.
- `.env.example` contains dummy placeholders; `.env.local` is ignored by the existing `.gitignore`.
- No third-party scripts were present in the inspected application JavaScript/JSX files, so none were moved to `next/script`. If an integration is added later, load non-critical scripts with `strategy="lazyOnload"` or `afterInteractive` as appropriate.

The code changes should reduce unnecessary browser work (no new font fetch, no eager loading of below-fold photos) and prevent unoptimized cart image delivery, but their impact on LCP/CLS/INP remains unmeasured. `next/image` does not by itself establish a measured speedup.

## Environment

Copy `.env.example` to `.env.local` and replace placeholders with local development values. `.env.local` is ignored by Git. Do not commit real secrets.
