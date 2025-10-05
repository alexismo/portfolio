# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository: /Users/alexis/code/portfolio (macOS, zsh)

1) Commands you’ll actually use here

Current state (vanilla HTML/CSS/JS; no package.json)
- Local preview server (pick one):
  - Python 3: python3 -m http.server 5173
  - Node (on-demand): npx serve -s . -l 5173
  Then open http://localhost:5173/index.html
- Build: none (static files only)
- Lint: none configured
- Tests: none configured

After migrating to Astro (see plan below)
- Start dev server: npm run dev
- Build for production: npm run build
- Preview built site: npm run preview

2) High-level architecture and structure

The site is a set of standalone HTML pages with copy-pasted shared UI:
- Pages: top-level .html files like index.html, about.html, compass.html, etc. Each includes the same header (name, role, nav, social icons) and footer (copyright, social icons, playful emoji).
- Shared CSS: css/reset.css, css/bootstrap.min.css, css/main.css plus page-scoped styles (e.g., css/about.css, css/compass.css, etc.). main.css defines typography, color tokens, layout primitives, project cards, social icon masks, lightbox visuals, and animations.
- Shared JS: js/main.js powers the intro resizing helpers and a modal image lightbox (uses a <dialog id="lightbox"> element when present on a page, e.g., compass.html). Some pages include small inline scripts for responsive sizing.
- Assets: images/ contains per-project imagery and social icons; fonts/ contains Proxima Nova and FontAwesome font files. prototypes/ contains a Framer prototype that is not part of the user-facing site.
- Analytics: Every page embeds the same Google Analytics gtag snippet (G-338P9KBK61) in <head>.

Implications
- Header/footer and social icons are duplicated across pages; ideal for extraction into layout and components.
- Global CSS can be kept as a single stylesheet initially; icon masks rely on assets in images/social/*.
- Lightbox requires a page-level <dialog id="lightbox">; include it in a shared layout to keep behavior consistent.

3) Astro migration plan (incremental, low-risk)

Goal: Replace duplicated markup with a shared Astro layout and components, while preserving current URLs and assets. Migrate page-by-page on a feature branch.

Branch and scaffold
- Create a feature branch: git checkout -b astro-migrate
- Initialize Astro at repo root: npm create astro@latest
  - Choose "Use existing directory" when prompted, minimal template is fine
  - Accept TypeScript or JavaScript per preference (either works here)
  - Install dependencies when prompted

Map structure
- public/: Move static assets here without changing paths:
  - images/, fonts/, and any videos (e.g., images/projects/**) → public/
  - Keep prototypes/ out of src; either leave at root or move to public/prototypes/ if it must be web-accessible
- src/styles/: Move css/main.css and any truly global styles. Page-specific CSS can start global; later refactor to component-scoped styles as desired.
- src/components/: Extract shared UI
  - Header.astro: name, role, nav (Work/About), social icons
  - Footer.astro: copyright, social icons, emoji
  - SocialIcon.astro (optional) if you want to de-duplicate the icon markup
- src/layouts/Base.astro: Shared HTML skeleton (<html>, <head>, <body>)
  - Include the GA gtag snippet once in the layout head (optionally only in production)
  - Link global CSS (e.g., import '../styles/main.css')
  - Include <dialog id="lightbox"></dialog> so the lightbox works everywhere
  - Slot page content with <slot />

Pages
- For each .html at the repo root, create an .astro page:
  - /index.html → src/pages/index.astro
  - /about.html → src/pages/about.astro
  - /compass.html → src/pages/compass.astro
  - …and so on for englishlive, classroom, flame, ampup, dgud, artofperformance, etc.
- Each page should set its own <title> and any meta tags in the layout’s <head> via Astro’s set:html or frontmatter props if you split those out later.
- Inline scripts specific to a page can remain inline within that page’s .astro for now.

Scripts
- Move js/main.js to something like public/js/main.js or src/scripts/main.js
  - If using public/js/main.js: reference it once in the Base layout before </body>
  - If using src/scripts with bundling: add a <script> in the layout that imports it, or inline only the code you need
- Ensure the lightbox listeners bind once (placing the script in the shared layout avoids per-page duplication). Keep <dialog id="lightbox"> in the layout.

Commands
- After initialization, you’ll have:
  - npm run dev (default 4321/3000/5173 depending on template; use the port it prints)
  - npm run build → outputs to dist/
  - npm run preview → serves the built site locally

URL parity and cleanup
- Keep existing page slugs (about, compass, etc.) so inbound links keep working. Astro pages named about.astro deploy as /about.
- Once each page is validated, remove the legacy .html counterpart (or keep temporarily while you migrate others). Commit in small, reviewable chunks.

4) Ancillary docs and rules discovered
- WARP.md: newly created by this change
- README.md: not present
- CLAUDE.md / Cursor rules / GitHub Copilot instructions: not present
- Linting/formatting/testing configs: not present (no package.json, no eslint/prettier/vitest)

Notes for future changes
- Do not introduce generic policies here; keep this file focused on concrete commands and structure. If you add tooling (npm scripts, eslint, tests), update “Commands” accordingly and briefly note where configs live.

