# Blog Walkthrough — alexismorin.com

## What this is

A guided, hands-on re-implementation of the blog that was auto-built on the `blog` branch (commit `215bc21`). The user writes all code by hand; Claude explains each piece and reviews the work before moving to the next task.

**Reference**: The complete working implementation lives on the `blog` branch. Any file can be inspected there: `git show blog:src/layouts/BlogPost.astro`, etc.

**Working branch**: `blog-walkthrough` (branched from `main`)

**Dev server**: `npm run dev` at http://localhost:4321

---

## Progress

### Phase 1 — Foundation
- [x] Task 1 — Install dependencies and configure Astro (`6821f37`)
- [x] Task 2 — Remark reading-time plugin (`6821f37`)
- [x] Task 3 — Content collection schema (`feb72cf`)
- [x] Task 4 — FormattedDate component (`65da673`)
- [x] Task 5 — Prose component (`aec3d22`)

### Phase 2 — First working post
- [x] Task 6 — Sample post (`src/content/blog/hello-world.mdx`) (`19ca3be`)
- [x] Task 7 — BlogPost layout (`src/layouts/BlogPost.astro`) (`f16bdc4`)
- [x] Task 8 — Dynamic post route (`src/pages/blog/[...slug].astro`) (`ba9833f`)
- [x] ✓ Checkpoint: `npm run dev` → `/blog/hello-world` renders with reading time, date, prose
- [ ] Task 9 — blog-post.css
- [ ] Task 10 — TableOfContents component
- [ ] ✓ Checkpoint: ToC visible in sidebar, active section highlights on scroll

### Phase 3 — Listing page
- [x] Task 11 — BlogCard component (`c509768`)
- [ ] Task 12 — Blog listing page (`src/pages/blog/[...page].astro`)
- [ ] Task 13 — blog.css
- [ ] ✓ Checkpoint: `/blog` shows card grid, pagination nav
- [ ] Task 14 — Tag filter pages (`src/pages/blog/tags/[tag].astro`)
- [ ] ✓ Checkpoint: `/blog/tags/<tag>` shows filtered cards

### Phase 4 — Infrastructure
- [ ] Task 15 — RSS feed (`src/pages/rss.xml.ts`)
- [ ] Task 16 — Nav link + sitemap cleanup
- [ ] ✓ Checkpoint: `npm run build` passes, sitemap-index.xml in dist/

### Phase 5 — Enhancements
- [ ] Task 17 — OG image generation
- [ ] ✓ Checkpoint: `/blog/hello-world/og.png` is a valid 1200×630 PNG
- [ ] Task 18 — standard.site well-known endpoint
- [ ] Task 19 — BlueskyComments component

---

## Session continuity

To resume after context is cleared:
1. Read this file
2. Run `git -C /Users/morina/code/portfolio log --oneline blog-walkthrough` to see which tasks are already committed
3. Run `git -C /Users/morina/code/portfolio diff main --stat` to see what's changed
4. Ask the user which task they were on, or infer it from the git log

---

## Stack context

- **Astro v7**, static output, GitHub Pages, custom domain `alexismorin.com`
- **TypeScript strict** (`tsconfig.json` extends `astro/tsconfigs/strict`)
- **CSS**: custom properties only — no framework. Key tokens:
  - `--dark-grey: #09090c`, `--grey: #161619`, `--white: #fff`, `--links: hsl(208, 72%, 68%)`
  - Variable font weights: `--ff-reg`, `--ff-semi`, `--ff-bold` (font-variation-settings values)
  - Breakpoints: `736px` (mobile), `1024px` (desktop)
  - Fluid inline padding: `var(--pi)`
- **Layout contract**: `Base.astro` takes `title?` and `metaD?`. Slots: `<slot name="head" />` for per-page `<style>`/`<link>` tags; `<slot />` for body content.
- **Per-page CSS pattern**: import a `.css` file in the Astro frontmatter (`import '../styles/foo.css'`) — it gets injected automatically.

---

## Task list

Each task ends with a commit. The commit message is the signal that a task is done.

### Phase 1 — Foundation

**Task 1 — Install dependencies and configure Astro**

Install:
```bash
npx astro add mdx sitemap
npm i @astrojs/rss reading-time mdast-util-to-string
```

Edit `astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs';

export default defineConfig({
  site: 'https://alexismorin.com',
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkReadingTime] }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      defaultColor: false,
      wrap: true,
    },
  },
});
```

*Why `defaultColor: false`*: Shiki emits `--shiki-light`/`--shiki-dark` CSS vars instead of inline colors, so we can pick the dark theme in CSS without touching the post files.

*Why `unified()` instead of `remarkPlugins`*: Astro v7 deprecated the old `markdown.remarkPlugins` key in favour of `markdown.processor: unified({...})` from `@astrojs/markdown-remark`.

*Why `site`*: RSS and sitemap both need absolute URLs; `site` provides the origin.

Commit: `blog: install dependencies and configure astro`

---

**Task 2 — Remark reading-time plugin**

Create `src/plugins/remark-reading-time.mjs`:
```js
import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime() {
  return function (tree, { data }) {
    const text = toString(tree);
    data.astro.frontmatter.minutesRead = getReadingTime(text).text;
  };
}
```

*Why a remark plugin*: Remark runs over the Markdown AST before the post renders. The plugin reads the raw text, computes reading time, and stores it in `data.astro.frontmatter` — a special Astro slot that surfaces as `remarkPluginFrontmatter` on the `render()` result. This keeps it out of the authored frontmatter (it's derived, not written by hand).

Commit: `blog: remark reading-time plugin`

---

**Task 3 — Content collection schema**

Create `src/content.config.ts`:
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title:               z.string().max(120),
      description:         z.string().max(300),
      pubDate:             z.coerce.date(),
      updatedDate:         z.coerce.date().optional(),
      category:            z.string().default('General'),
      tags:                z.array(z.string()).default([]),
      draft:               z.boolean().default(false),
      ogImage:             image().optional(),
      author:              z.string().default('Alexis Morin'),
      blueskyPostUri:      z.string().optional(),
      standardDocumentUri: z.string().optional(),
    }),
});

export const collections = { blog };
```

*Why Zod schema*: Astro validates every post against this at build time. Missing `title` or wrong date format → build error, not a silent bug in production.

*Why `z.coerce.date()`*: YAML dates (`2026-06-27`) are plain strings. Coercion converts them to `Date` objects automatically.

*Why `image()` not `z.string()`*: Astro's `image()` validator checks that the referenced file actually exists at build time and enables image optimisation.

*Why `blueskyPostUri` and `standardDocumentUri` are `z.string().optional()`*: They're not required on every post — only added when you publish to Bluesky or register on AT Protocol.

Commit: `blog: content collection schema`

---

**Task 4 — FormattedDate component**

Create `src/components/FormattedDate.astro`:
```astro
---
interface Props { date: Date }
const { date } = Astro.props;
const formatted = date.toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric',
});
---
<time datetime={date.toISOString()}>{formatted}</time>
```

*Why a component*: Dates need two representations simultaneously — the human-readable string AND the machine-readable ISO string in `datetime` for accessibility and scrapers. Wrapping it in a component means you never forget the `datetime` attribute.

Commit: `blog: FormattedDate component`

---

**Task 5 — Prose component**

Create `src/components/Prose.astro`:
```astro
---
---
<div class="prose">
  <slot />
</div>
```

*Why a wrapper*: All blog-post typography (heading sizes, paragraph spacing, blockquotes, code blocks) is scoped to `.prose` in `blog-post.css`. If you want to use that typographic style somewhere else later, you just wrap with `<Prose>` instead of copying CSS.

Commit: `blog: Prose wrapper component`

---

**Task 6 — BlogCard component**

Create `src/components/BlogCard.astro`. It receives a `CollectionEntry<'blog'>` and renders a linked card showing title, description, category, date, and tags.

*What to build*: An `<article>` with an `<a>` covering the whole card. Destructure `post.data` for the fields. Link to `/blog/${post.id}/`.

*Why `post.id` not `post.slug`*: In the Content Layer API (Astro v5+), the stable identifier is `id` — it's the filename without extension (e.g. `hello-world`). `slug` is legacy.

Commit: `blog: BlogCard component`

---

**Task 7 — TableOfContents component**

Create `src/components/TableOfContents.astro`. This is the most involved component.

**Props**: `headings: MarkdownHeading[]` — comes from `render(entry)` in the page route.

**What to build**:
1. Filter `headings` to `depth === 2 || depth === 3` only
2. Nest H3s under their preceding H2 (loop, push to `subheadings[]`)
3. Render as `<details open>` / `<summary>On this page` / `<nav>` / `<ol>`
4. H3s get a nested `<ol>` inside their H2's `<li>`
5. Each `<a>` gets `href="#${h.slug}"` and `data-toc-link={h.slug}`

**Active-section highlighting — two layers**:

Layer 1 — CSS `scroll-target-group` (progressive enhancement, no JS):
```css
/* On the article element in BlogPost.astro: */
scroll-target-group: auto;

/* On the ToC links: */
.toc-list a:target-current {
  color: var(--white);
  border-inline-start: 2px solid var(--links);
}
```
The article is declared as a scroll-target group. The browser tracks which section anchor is "current" and applies `:target-current` to matching links. This is a 2025/2026 CSS feature (https://una.im/scroll-target-group/).

Layer 2 — `IntersectionObserver` fallback (for browsers without `:target-current`):
```js
if (CSS.supports('selector(:target-current)')) return; // already handled
const obs = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (e.isIntersecting) {
      links.forEach(l => l.removeAttribute('aria-current'));
      byId.get(e.target.id)?.setAttribute('aria-current', 'location');
    }
  }
}, { rootMargin: '-100px 0px -66% 0px' });
headings.forEach(h => obs.observe(h));
```
`aria-current="location"` gets the same CSS as `:target-current` — same visual, different mechanism.

**Re-init on view transitions**: wrap the init in a function, call it on `astro:page-load` (not `DOMContentLoaded`), because Astro's view transitions don't fully reload the page.

**Desktop layout** (≥1024px): `position: sticky; top: 100px; align-self: start` — needs the parent grid to have `align-items: start` too.

**Mobile**: `<details>` is natively collapsible. On desktop, disable the toggle via CSS (`pointer-events: none` on the summary).

Commit: `blog: TableOfContents component`

---

**Task 8 — BlogPost layout**

Create `src/layouts/BlogPost.astro`. This is the central layout for every post.

**Props**: `post`, `headings`, `minutesRead`, `prev?`, `next?`

**Structure**:
1. Import and extend `Base.astro`
2. Through `<Fragment slot="head">`: emit canonical, OG meta, Twitter card, article timestamps, RSS autodiscovery link, and (when `standardDocumentUri` is set) `<link rel="site.standard.document" href={...} />`
3. Post header: category link, `FormattedDate`, reading time, H1 title, lede
4. `.post-layout` grid wrapping `<TableOfContents>` + `<Prose><slot /></Prose>`
5. Tags footer
6. `<BlueskyComments>` when `blueskyPostUri` is set
7. Prev/next nav

**OG image**: Always generated — use `/blog/${post.id}/og.png` as the default. If `ogImage` is set in frontmatter, use that instead (override).

**`scroll-target-group` on the article**: Add the `scroll-target-group` attribute to the `<article>` element so the CSS scroll-target feature knows the ToC links and the article headings belong to the same group.

Commit: `blog: BlogPost layout`

---

**Task 9 — Blog listing page**

Create `src/pages/blog/[...page].astro`.

**Key points**:
- `export const getStaticPaths = (async ({ paginate }) => {...}) satisfies GetStaticPaths`
- Filter drafts: `getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft)`
- Sort newest first: `b.data.pubDate.getTime() - a.data.pubDate.getTime()`
- `paginate(posts, { pageSize: 6 })` → generates `/blog` (first page, param is `undefined`) and `/blog/2`, `/blog/3`…
- Render tag filter rail: collect all unique tags with `new Set(posts.flatMap(p => p.data.tags))`
- Pagination nav: only show if `page.lastPage > 1`

*Why `[...page]` (rest param) instead of `[page]`*: Astro's `paginate()` returns `undefined` for the first page, so the URL is `/blog` (not `/blog/1`). A rest param handles the optional segment.

Commit: `blog: listing page with pagination`

---

**Task 10 — Dynamic post route**

Create `src/pages/blog/[...slug].astro`.

**Key points**:
- `getStaticPaths` builds `params: { slug: post.id }` for each non-draft post
- Pass `prev` and `next` as props (sorted array, use `posts[i-1]` and `posts[i+1]`)
- In the component body: `const { Content, headings, remarkPluginFrontmatter } = await render(post)`
- `remarkPluginFrontmatter.minutesRead` is the reading time string from Task 2

*Why `[...slug]` (rest param)*: Post IDs could contain slashes if you ever nest posts in subdirectories (e.g. `2026/hello-world`). A rest param handles that without changes.

Commit: `blog: dynamic post route`

---

**Task 11 — Tag pages**

Create `src/pages/blog/tags/[tag].astro`.

**Key points**:
- `getStaticPaths`: collect unique tags, return one entry per tag with its filtered posts as props
- Normalize to lowercase: `tag.toLowerCase()` — keeps URLs consistent
- Render the same `BlogCard` grid as the listing page
- Include a `← All posts` back-link

Commit: `blog: tag filter pages`

---

**Task 12 — RSS feed**

Create `src/pages/rss.xml.ts`:
```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  return rss({
    title: 'Alexis Morin — Blog',
    description: '...',
    site: context.site!,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: `<language>en-us</language>`,
  });
}
```

*Why always exclude drafts*: Even in dev, RSS is what feed readers see. A draft appearing in the feed would be confusing.

*Why `context.site!`*: `@astrojs/rss` needs an absolute origin to build item URLs. `Astro.site` is `undefined` if `site` isn't set in `astro.config.mjs` — the `!` asserts it's set (which it is, from Task 1).

Commit: `blog: RSS feed`

---

**Task 13 — blog.css**

Create `src/styles/blog.css`. Styles for the listing page, tag filter rail, post grid, blog card, and pagination.

Reuse the existing design tokens: `var(--white)`, `var(--links)`, `var(--grey)`, `var(--ff-semi)`, `var(--ff-bold)`, `var(--pi)`.

*Key patterns to implement*:
- `.post-grid`: `display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 28rem), 1fr))`
- `.blog-card-link`: `border: 1px solid` + hover state
- `.tag-filter-item`: pill shape with `border-radius: 999px`, active state uses `var(--links)` border
- `.pagination`: centered flex row

Import this file in the listing and tag pages via frontmatter import.

Commit: `blog: listing styles`

---

**Task 14 — blog-post.css**

Create `src/styles/blog-post.css`. Styles for the post page layout, post header, prose typography, code blocks, post-tags footer, and prev/next nav.

*Key patterns to implement*:
- `.post-layout`: single column by default; at `≥1024px` becomes `grid-template-columns: 1fr 14rem` (prose + ToC). ToC is `order: 2`, prose is `order: 1` so ToC renders first in HTML (better for screen readers) but appears on the right visually.
- `.prose h2/h3/h4`: `scroll-margin-top: 7rem` so anchors aren't hidden behind the sticky header
- Shiki dark theme override (since the site is always dark):
  ```css
  .prose pre, .prose pre span {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
  }
  ```
- `.post-nav`: two-column grid; collapses to one column at `≤736px`

Import this file in `BlogPost.astro` via frontmatter import.

Commit: `blog: post page styles`

---

**Task 15 — Nav link + sample post + sitemap cleanup**

Three small wiring tasks bundled together since each is one or two lines:

1. Add `<li><a href="/blog">Blog</a></li>` to the nav in `src/components/Header.astro`
2. Delete `public/sitemap.xml` — `@astrojs/sitemap` generates `sitemap-index.xml` at build time; the hand-written file would shadow it
3. Create `src/content/blog/hello-world.mdx` — a real post that exercises all schema fields (title, description, pubDate, category, tags, author). Include at least one H2, one H3, and one fenced code block so the ToC and syntax highlighting are testable.

After this task, `npm run build` should produce all routes including `/blog`, `/blog/hello-world`, `/blog/tags/*`, `/rss.xml`, and `sitemap-index.xml`.

Commit: `blog: nav link, sample post, sitemap`

---

### Phase 2 — Enhancements

**Task 16 — OG image generation**

Install:
```bash
npm i satori @resvg/resvg-js wawoff2
```

Add to `astro.config.mjs`:
```js
vite: {
  ssr: { external: ['@resvg/resvg-js'] },
  optimizeDeps: { exclude: ['@resvg/resvg-js'] },
}
```
*Why*: `@resvg/resvg-js` uses native Node bindings (WASM). Vite's SSR bundler can't inline it — it must stay as an external `require()`.

Create `src/pages/blog/[slug]/og.png.ts`. This is an Astro static API endpoint:
- `getStaticPaths`: one entry per non-draft post, `params: { slug: post.id }`
- `GET`: load font (`src/fonts/prxnv-reg.woff2` — the fixed-weight variant; the variable font's complex tables break satori), decode woff2 → OpenType with `wawoff2.decompress()`, call `satori()` with the post title/description/category/author, convert SVG → PNG with `Resvg`, return `new Response(png, { headers: { 'Content-Type': 'image/png' } })`

*Why `prxnv-reg.woff2` not `pv.woff2`*: Satori doesn't support WOFF2 directly (only TTF/OTF/WOFF). `wawoff2` decompresses it to raw OpenType, but `pv.woff2` is a variable font with complex OpenType tables that trip up satori's internal parser. The static-weight `prxnv-reg.woff2` decompresses cleanly.

*Why `process.cwd()` for the font path*: `import.meta.url` in a prerendered endpoint resolves to the compiled bundle location (`dist/.prerender/chunks/...`), not the source. `process.cwd()` is always the project root.

Update `BlogPost.astro` to always emit the generated image:
```ts
const ogImageUrl = ogImage
  ? new URL(ogImage.src, Astro.site).toString()
  : new URL(`/blog/${post.id}/og.png`, Astro.site).toString();
```

Commit: `blog: build-time OG image generation`

---

**Task 17 — standard.site protocol**

The standard.site protocol (https://standard.site) integrates AT Protocol (Bluesky) with the web. Two things are needed:

1. `public/.well-known/site.standard.publication` — plain text file whose content is the AT-URI of your publication record on AT Protocol. Create it with a placeholder for now:
   ```
   at://did:plc:REPLACE_WITH_YOUR_DID/site.standard.publication/REPLACE_WITH_RKEY
   ```
   To get the real value: create a publication record via the standard.site interface, then replace the placeholder.

2. `<link rel="site.standard.document" href="at://...">` in each post's `<head>` — links the page to its AT Protocol document record. This is already wired in `BlogPost.astro` via `standardDocumentUri` in the schema (done in Task 3). No code change needed here; just test by adding `standardDocumentUri: at://...` to a post's frontmatter.

Commit: `blog: standard.site well-known endpoint`

---

**Task 18 — BlueskyComments component**

Create `src/components/BlueskyComments.astro`.

**Props**: `postUri: string` (AT URI of the Bluesky post)

**Structure**:
- Server-side: render a container `<div class="bsky-thread" data-post-uri={postUri}>` with a loading placeholder. Also compute the `https://bsky.app/...` URL from the AT URI for the "Reply on Bluesky" link.
- Client-side `<script>`: on `astro:page-load`, find all `.bsky-thread[data-post-uri]` elements, fetch `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=...&depth=5`, map the replies array into comment HTML, inject it.

*Why client-side*: Comments are live — a rebuild would be needed to pick up new replies if done at build time. Client-side fetch means comments are always current without a deploy.

*Why `astro:page-load` not `DOMContentLoaded`*: Astro's view transitions only swap the `<body>` contents; `DOMContentLoaded` doesn't re-fire. `astro:page-load` fires after every navigation, including soft navigations.

*AT URI → bsky.app URL conversion*:
```ts
const [did, , rkey] = uri.replace('at://', '').split('/');
// → https://bsky.app/profile/${did}/post/${rkey}
```

**Enable on a post**: add `blueskyPostUri: "at://did:plc:xxx/app.bsky.feed.post/yyy"` to frontmatter. Get the AT URI by opening the Bluesky post, clicking `⋯` → `Copy post link`, then converting: the URL `https://bsky.app/profile/handle/post/RKEY` maps to `at://did:.../app.bsky.feed.post/RKEY`.

Commit: `blog: Bluesky comments component`

---

## Verification checklist (run after all tasks)

```bash
npm run build
```

Check:
- [ ] `/blog` — listing page with tag filter rail
- [ ] `/blog/hello-world` — post with reading time, ToC, code block, OG meta pointing to `/blog/hello-world/og.png`
- [ ] `/blog/hello-world/og.png` — 1200×630 dark-themed PNG exists
- [ ] `/blog/tags/astro` — filtered listing
- [ ] `/rss.xml` — valid RSS 2.0, no drafts
- [ ] `sitemap-index.xml` in `dist/` — generated, not hand-written
- [ ] `dist/.well-known/site.standard.publication` — present
- [ ] No errors in build output (the `:target-current` lightningcss WARN is expected and harmless)
