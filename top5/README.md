# Handoff: AmpliFi · Everybody's Got a Top 5

## Overview
Phone-first web experience. A person taps/scans an NFC poster at a venue, picks their five most life-changing songs (live catalog search), places each on a mood × energy grid, and sees community results as heat maps. `index.html` is the AmpliFi home page that links to the experience.

## About the design files
These are **high-fidelity HTML design references** — working prototypes showing the intended look and behavior, not production code. Recreate them in the target codebase's stack using its patterns. If there is no codebase yet, pick an appropriate framework (e.g. Next.js/React) and implement there. Open the HTML files directly in a browser to see exact behavior.

## Files
- `index.html` — AmpliFi home (static HTML/CSS).
- `Championship Vinyl Top 5.html` — the Top 5 app shell + all CSS. Loads `app.bundle.js`.
- `app.bundle.js` — pre-compiled bundle of `src/` (what actually runs).
- `src/` — readable source: `data.js` (posters, presets, sample data), `ui.jsx` (TopBar, Masthead, shared bits), `screens-flow.jsx` (landing, search/pick, grid placement, sign-in), `screens-results.jsx` (results + heat maps), `app.jsx` (routing/state).
- Images: `soundtrack.webp` (masthead headline), `top5-lockup-v3.webp` ("Everybody's got a Top 5" lockup), `beat-kitchen.webp` (venue logo), `amplifi.webp` (AmpliFi mark), `cv-logo.webp` (home-page feature headline; same art as soundtrack.webp).

## Routing / posters
- Each physical poster encodes its own URL: `Championship Vinyl Top 5.html?poster=<id>`. Current poster: `cv-07` → place "Beat Kitchen Chicago", logo `beat-kitchen.webp` (`src/data.js` → `POSTERS`).
- With a poster param: landing shows "You tapped on the poster at {place}" and the venue logo above the Top 5 lockup.
- Without one (web visitor): landing shows "Find the poster at {place}"; no venue logo.

## Screens
1. **Landing** — masthead image (`soundtrack.webp`), optional venue logo, Top 5 lockup, tap line, primary CTA "Start my Top 5".
2. **Pick 5** — live song search, numbered slots 1–5 with album art; sticky action bar shows count.
3. **Place on grid** — each song dragged/tapped onto a 2-axis grid (x: heavier ↔ lighter; y: calmer ↔ more energy).
4. **Sign in** — to save; top bar then shows only "Sign out" (no email shown).
5. **Results** — "Mine" and "Everyone" tabs; community heat map. Heat scale: blue gradations for fewer picks, orange for concentrated picks, hard break between them; rectangular "Fewer → More" key.

## Layout & responsive rules
- Single column, max content width 480px, centered; safe-area insets respected (`env(safe-area-inset-*)`), `100dvh` handling.
- Masthead image, venue logo and Top 5 lockup share one width: `--logo-w: min(340px, calc(min(480px,100vw) - 84px))`, height auto (scale proportionally).
- Touch targets ≥ 44px; `touch-action: manipulation` (no tap delay).

## Design tokens
Colors: paper `#f2e4c4`, paper-2 `#e9d6ad`, card `#f8edd4`, ink (navy) `#1d3354`, ink-2 `#14243d`, muted `#475670`, red `#e2492b`, red-ink `#c23a1b`, line `rgba(29,51,84,.28)`.
Type (Google Fonts): Archivo variable (wdth 62–125, wght 400–900) for all UI — condensed headings at `font-stretch:62%; weight 900; uppercase`; kickers 13px/800, stretch 80%, letter-spacing .14em, uppercase. Alfa Slab One for numerals/accents. Yellowtail for script accents.
Texture: SVG fractal-noise "speck" and "fiber" overlays (defined as CSS vars in the HTML `:root`) for the letterpress paper feel. Borders 2.5px solid ink.
Exact values for every component are in the `<style>` block of `Championship Vinyl Top 5.html`.

## Data / integrations
- Song search currently calls Apple's public iTunes Search API client-side (JSONP). **For production, proxy Apple Music API through your own server.**
- Community results/heat-map data is sample data in `src/data.js`; needs a real backend (store user picks + grid positions per poster, aggregate per cell).
- Auth is mocked; implement real sign-in.

## Known asset notes
`top5-lockup-v3.webp` and `beat-kitchen.webp` are low-res relative to their display width — request ~1000px-wide originals.
