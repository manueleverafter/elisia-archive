# elisia archive ♡

Unofficial fan archive for Elisia, kept by the **Elysian Fortress (ELFORT)**.

**Live:** https://elisia-archive.vercel.app

Public site for fans, plus an admin panel at `/admin` where mods add, edit and delete content themselves:
videos, polaroids, music, fanbase posts, press, socials, profile facts and the site's default theme.

## Stack

| Piece | Service | Free limit |
|---|---|---|
| Website | **Next.js 16** (App Router, Cache Components) on **Vercel** | Hobby plan |
| Database | **MongoDB Atlas**, its own project and cluster (`elisia-archive`) | 512 MB |
| Photos | **Cloudflare R2**, bucket `elisia-archive` | 10 GB, free downloads |
| Mod logins | **Better Auth**, stored in the same database | — |

Styling is **Tailwind CSS v4** with OKLCH theme tokens.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill it in (see the comments inside)
npm run seed                 # starting content + indexes; safe to re-run
npm run dev                  # http://localhost:3000
```

| Script | Does |
|---|---|
| `npm run build` | Production build check |
| `npm run lint` | Lint |
| `npm run seed` | Adds the starting content where collections are empty, and creates indexes |
| `npm run backup` | Exports every collection to `backups/<time>/` (git-ignored). **Free Atlas has no automatic backups.** |
| `npm run check:r2` | Uploads, reads and deletes a test file to confirm the R2 settings work |

## Mods: how the admin works

1. **First admin:** open `/admin/setup` and create the account. It only accepts the email in `ADMIN_EMAIL`,
   and only while no account exists.
2. **Inviting mods:** Admin → **Mods** → enter their email and role → **Create invite** → send the link
   privately. It works once and expires in 72 hours. The mod picks their own name and password.
3. **Forgotten password:** an admin presses **Reset password** next to the mod and sends them the new link.
   No email service is needed for any of this.
4. **Roles:** *Admin* can do everything. *Editor* can add, edit and delete content, but can't manage mods,
   change the site theme, or delete forever.
5. **Deleting:** goes to **Trash** for 30 days, restorable by anyone. Admins can delete forever, which also
   removes the photo files from R2.
6. **Featured video:** tick *Feature on the home page* on a YouTube clip. The newest featured clip plays
   silently behind the home page title, with sound, pause and restart buttons.

Photos are resized in the browser before upload: a fast WebP copy (max 1600px) for the site, and the
untouched original kept for the **HD** button.

## Where things live

| Path | What |
|---|---|
| `src/config/site.ts` | Site name, tagline, fandom name, nav |
| `src/lib/resources.ts` | Admin content definitions: every field of every section, in one place |
| `src/lib/data.ts` | Cached public reads |
| `src/lib/server/*` | Database, auth, R2, sessions, invite tokens, content helpers (server only) |
| `src/app/(site)/*` | Public pages |
| `src/app/admin/*` | Admin: `(auth)` login/setup/invite pages, `(panel)` the panel, `actions.ts` every server action |
| `src/app/globals.css` | Color tokens for every theme + light/dark mode |
| `scripts/*` | Seed, backup, R2 check |

To add a field to a section, add it to that section in `src/lib/resources.ts`; the form, validation and
saving follow automatically. Show it on the public page via `src/lib/data.ts`.

## Themes

Mode (Light / Dark / Auto) and color theme are separate choices. Each theme is defined by up to three hues
in `globals.css`:

```css
[data-theme="dreamy"] { --h: 355; --h2: 305; --h3: 235; --c: 0.16; }
```

To add a theme: add one line there, then add it to `themes` in `src/lib/themes.ts`.

## Known limits

- **Theme choice is per browser.** It lives in the visitor's local storage.
- **Direct database edits don't show up by themselves.** Public pages are cached until something is saved in
  the admin panel. After editing the database by hand or with a script, save any item in the admin (or
  redeploy) to refresh the site.
- **Uploads that are never saved stay in R2.** If a mod uploads a photo and then cancels the form, the file
  remains. It is small and harmless, but not cleaned up automatically yet.
- **Photos belong to their owners.** The code is MIT licensed; the photos, videos and articles the archive
  shows are not, and stay credited to their sources.

## Roadmap

1. ✅ Layout, navigation, theme system, public pages
2. ✅ Database, mod login, roles, invites
3. ✅ Admin panel for every section, trash, activity log, photo uploads
4. ✅ Video hero with sound / pause / restart
5. ✅ Deployed on Vercel: every push to `main` goes live automatically
6. ⏳ Custom domain (optional)

---

## Notes for anyone editing this

Things that broke during development and are easy to reintroduce.

**A `"use client"` file can only hand components to the server.** Constants and helpers exported from a
client file arrive in a server component as empty references. That is how "Watch on YouTube" once rendered
as "Watch on". Shared, non-interactive helpers live in `src/components/media-shared.tsx`; keep them there.

**React resets `<form action={…}>` after every submit.** That wiped everything a mod had typed whenever
validation failed. Admin forms submit through `useKeepValuesSubmit()` instead; use it for any new form.

**Every server action checks the user first.** `requireActionUser()` (or `requireActionUser("admin")`) is
the first line of each action in `src/app/admin/actions.ts`. The admin pages being hidden is not security;
the action check is.

**Public reads are cached under the `content` tag.** Any action that changes what visitors see must call
`updateTag(CONTENT_TAG)`, or the change won't appear until the cache expires.

**Uncached reads need a request.** With Cache Components on, a database read that isn't behind
`"use cache"` must come after `await connection()` (or `headers()`, `searchParams`) and inside
`<Suspense>`, or the build fails trying to prerender it. `requirePageUser()` already calls `connection()`.

**The YouTube API replaces the element you give it.** `HeroVideo` hands it a `div` created by hand, never one
React renders, or React crashes removing a node that is no longer there.

**`dark:` follows the site's switch, not the OS.** `globals.css` redefines the `dark` variant on
`[data-mode="dark"]`. Without it, Tailwind's `dark:` follows the system setting and disagrees with the
picker.

**The header's blur traps fixed elements.** `backdrop-filter` on the sticky header makes it the containing
block for anything `position: fixed` inside it. The mobile menu is portalled to `document.body`.

**Colors come from tokens, never literals.** Use `bg-surface`, `text-muted`, `text-primary`. Text on
`bg-primary` uses `text-primary-fg`, never `text-white`: dark-mode primaries are pastel.

**Theme state is read through `useSyncExternalStore`.** Reading `localStorage` during render causes a
hydration error.

**Dates are formatted in UTC on the server.** `formatDate()` pins `timeZone: "UTC"`.

## License

Code: MIT, see [LICENSE](LICENSE). Content shown on the site belongs to its original owners.
