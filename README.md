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

## Roadmap

1. ✅ Layout, navigation, theme system, public pages with sample data
2. ⏳ Supabase: database tables, mod login, roles (admin / editor)
3. ⏳ Admin panel: add / edit / delete media, polaroids, posts, press, socials, profile, featured clip
4. ⏳ Image upload with compression, search across real data, SEO polish
5. ⏳ Deploy to Vercel, custom domain
