# dist folder audit (static build)

## Findings

- **Public Supabase credentials** – `build/assets/index-BlMFuRal.js:1` bundles the Supabase base URL and the literal anon JWT (`eyJhbGciOiJIUzI1Ni…`) alongside privileged function URLs such as `https://mdkswlgcqsmgfmcuorxq.supabase.co/functions/v1/ingest-async-auth-enriched`. Anyone who can fetch the static files can replay those endpoints and exhaust quotas or probe data. If these functions are not intended for unrestricted public use, rotate the anon key and proxy the calls through a server/edge function guarded by service-role tokens and Row Level Security.

- **Incorrect document language** – `build/index.html:3` declares `<html lang="en">`, yet the rendered bundle still ships Spanish text (e.g. `"Iniciar Diagnóstico"` inside `build/assets/index-BlMFuRal.js:1`). Screen readers and SEO engines will misinterpret the content. Update the `<html>` language to the dominant locale (likely `es`) or localize the UI strings to match the declared language.

- **Missing metadata/manifest** – The static head only includes charset, viewport, title, and the JS/CSS assets (`build/index.html:5-9`). There is no description, robots tag, Open Graph/Twitter metadata, canonical URL, favicon, manifest, or theme-color hint. This hurts search ranking, rich previews, and PWA install prompts.

- **No SSR or `<noscript>` fallback** – The body contains only `<div id="root"></div>` (`build/index.html:12-14`). If JavaScript fails or is disabled, the user sees a blank page. Provide at least a `<noscript>` warning/loading skeleton, or ideally ship a server-rendered shell to improve first paint and accessibility.

- **Blocking font import** – `build/assets/index-C81lKvVt.css:1` still uses `@import "https://fonts.googleapis.com/...";` which blocks rendering and prevents preconnect optimizations. Declare the font via `<link rel="preconnect">` + `<link rel="stylesheet">` in the document head or self-host the font files with `font-display`.

- **Large bundle and images** – Vite emitted a warning because `build/assets/index-BlMFuRal.js` is ~1.3 MB, the CSS is ~102 kB, and multiple hero PNGs exceed 600 kB (`build/assets/444e8e22665a8cbdab132760610010dba89f3e67-rFa-wqN9.png`, `build/assets/60be6d6fe2b2bb2089603fb76c90d0926c3104a3-DmaVwwJE.png`). This will throttle mobile devices. Split the bundle with dynamic imports, tree-shake unused UI components, and convert large PNGs to optimized WebP/AVIF (or compressed JPG) served via `<img srcset>` with lazy loading.

- **Root-relative asset paths** – `build/index.html:8-9` references `/assets/index-BlMFuRal.js` and `/assets/index-C81lKvVt.css`. Deployments under a sub-path (e.g., GitHub Pages project sites) will 404. If subdirectory hosting is required, configure Vite’s `base` or add an explicit `<base>` tag that matches the deployment root.

## Recommendations

1. Decide whether Supabase edge functions should be callable from the client bundle; if not, rotate the anon key and route calls through secured services.
2. Fix accessibility/SEO issues by correcting `lang`, adding metadata/manifest icons, and providing a `<noscript>` or SSR fallback shell.
3. Improve performance budget: split JS chunks, trim unused CSS, self-host fonts, and optimize large images before redeploying.
