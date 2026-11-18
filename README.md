# elisia archive ♡

Unofficial fan archive for Elisia, kept by the **Elysian Fortress (ELFORT)**.

## Stack

- **Next.js 16** (App Router, Cache Components) + **TypeScript**
- **Tailwind CSS v4** with OKLCH theme tokens
- **Supabase** (coming next): database, mod login, photo storage
- Hosting: **Vercel** (free tier to start)

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build check
npm run lint
```

## Where things live

| Path | What |
|---|---|
| `src/config/site.ts` | Site name, tagline, fandom name, nav, default theme |
| `src/app/globals.css` | Color tokens for every theme + light/dark mode |
| `src/lib/themes.ts` | Theme list shown in the picker + no-flash script |
| `src/lib/data.ts` | Data layer (sample data now, Supabase later) |
| `src/lib/types.ts` | Content model (media, polaroids, releases, posts, press, socials) |
| `src/app/*` | Pages: home, media, photos, music, updates, press, socials, search, credits, privacy |

## Themes

Mode (Light / Dark / Auto) and color theme are separate choices. Each theme is
defined by up to three hues in `globals.css`:

```css
[data-theme="dreamy"] { --h: 355; --h2: 305; --h3: 235; --c: 0.16; }
```

To add a theme: add one line there, then add it to `themes` in `src/lib/themes.ts`.

## Known limits

- **Sample data only.** Everything marked *sample* is a placeholder until the database and admin panel exist.
- **Theme choice is per browser.** It lives in the visitor's local storage, so a phone and a PC each
  remember their own.
- **Photos belong to their owners.** The code is MIT licensed; the photos, videos and articles the archive
  links to are not, and stay credited to their sources.

## Roadmap

1. ✅ Layout, navigation, theme system, public pages with sample data
2. ⏳ Supabase: database tables, mod login, roles (admin / editor)
3. ⏳ Admin panel: add / edit / delete media, polaroids, posts, press, socials, profile, featured clip
4. ⏳ Image upload with compression, search across real data, SEO polish
5. ⏳ Deploy to Vercel, custom domain

---

## Notes for anyone editing this

Things that broke during development and are easy to reintroduce.

**A `"use client"` file can only hand components to the server.** Constants and helpers exported from a
client file arrive in a server component as empty references. That is how "Watch on YouTube" once rendered
as "Watch on". Shared, non-interactive helpers live in `src/components/media-shared.tsx`; keep them there.

**The header's blur traps fixed elements.** `backdrop-filter` on the sticky header makes it the containing
block for anything `position: fixed` inside it, so the mobile menu would open inside a 64px bar. The menu
is portalled to `document.body`. Do the same for any future overlay launched from the header.

**Colors come from tokens, never literals.** Use `bg-surface`, `text-muted`, `text-primary` and friends. A
hard-coded hex looks right in one theme and wrong in the other thirteen.

**Text on `bg-primary` uses `text-primary-fg`, never `text-white`.** Light-mode primaries are deep enough
for white text; dark-mode primaries are pastel and need dark text. The token flips per mode.

**Theme state is read through `useSyncExternalStore`.** The server can't know the visitor's theme, so the
picker renders a fixed default on the server and the real value after hydration. Reading `localStorage`
during render instead causes a hydration error.

**Dates are formatted in UTC on the server.** `formatDate()` pins `timeZone: "UTC"` so the server and the
browser agree on the date.

**Cache Components is on.** Anything that reads the request (`searchParams`, cookies) must sit inside
`<Suspense>`. See `src/app/search/page.tsx`.

## License

Code: MIT, see [LICENSE](LICENSE). Content shown on the site belongs to its original owners.
