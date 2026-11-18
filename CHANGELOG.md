# Changelog

What changed, and why. Newest first.

---

## Socials gets official link cards and a feed

Socials opens with **official links**: one tinted card per platform holding Elisia's accounts. Below it
sit the group and ELFORT links, then **latest updates**, a feed of her posts with a platform filter and a
Newest / Oldest switch.

The new **Social feed** admin section takes a post link and works out the rest it can. The platform comes
from the address. The **date** comes from the post id itself: Instagram post codes, TikTok video ids and X
post ids all carry their creation time, so mods leave the date empty for those. Checked against posts with
known dates; Instagram decodes to within two seconds.

TikTok's public embed info no longer includes the thumbnail or caption, so a link alone can't fill a card.
Pictures are uploaded like polaroids; a TikTok card without one shows a play button that loads TikTok's own
player in place.

---

## Fanbase becomes the ELFORT hub

The Fanbase page now reads like a notice board for the fandom rather than a list of posts: pinned **fan
notes** first, then **ELFORT official pages** grouped as community accounts, fan projects and website, then
**billboard ads around the world** grouped by year, the rest of the bulletin, and the three latest press
headlines with a link to all of them.

- **Fan ads** is a new admin section: a place, a date and the link to the post showing the ad. The page
  shows it as "Aug · South Korea".
- Posts can carry an optional **link**, so a note can open a voting guide or an X thread directly.
- Socials gained **ELFORT** groups. Fanbase pages appear on both Fanbase and Socials, with Elisia's own
  accounts listed first.
- Press gained an **Interview** coverage type and filter.

---

## Polaroids open into a viewer

Tapping a print now opens it large with its caption, credit, date and size, a **source** link back to
the original post, and **HD download**. Arrow keys, the on-screen arrows and a swipe on phones move between
photos; Esc, the close button or a tap outside closes it. It is a native `<dialog>`, so focus and Esc
behave without extra code.

HD download fetches the file before saving it, because browsers ignore the `download` attribute on links
to another domain and would just open the image in a tab. The file is saved as
`elisia-<caption>-<date>.jpg` rather than R2's internal name.

The profile facts editor got the full page width; next to the theme card the value boxes were squeezed
to nothing.

---

## The featured clip plays behind the title

The home hero now plays the featured YouTube clip silently in the background, with **sound**, **pause** and
**restart** buttons. It starts muted because browsers block autoplay with sound; it shows the thumbnail
until the video is really playing, pauses when scrolled out of view, and waits for a press of play for
visitors who turned on "reduce motion" or data saver. It plays through YouTube's own player in
privacy-enhanced mode, so the video stays hosted and counted by the official upload.

---

## Mods can run the archive without a developer

The archive now has a real database and an admin panel at `/admin`.

**Where things live.** Content in MongoDB Atlas, in its own project and cluster rather than the bot's,
because a fan site and a Discord bot shouldn't share a failure. Photos in Cloudflare R2, where downloads
are free: photos are the heaviest thing the site serves. Both have their own credentials that can't touch
the bot's data or bucket. That was tested: the site's R2 key gets a 403 on the bot's bucket.

**Logins without an email service.** Nobody can sign up. The first admin is created once on `/admin/setup`,
and only for the email in `ADMIN_EMAIL`. Every other mod joins through a one-time invite link an admin sends
privately; a forgotten password gets the same kind of link. Links expire, work once, and only a hash of them
is stored. Sign-in attempts are rate limited.

**One definition per section.** Each section's fields are listed once in `src/lib/resources.ts`; the admin
list, form, validation and trash all come from that. Adding a field is one line.

**Deleting is undoable.** Delete moves to Trash for 30 days. Only admins can delete forever, which also
removes the photo files. Every change lands in an activity log.

**Photos upload straight to R2.** The browser makes a 1600px WebP copy for the site and keeps the original
for the HD button, then uploads both with short-lived signed URLs that pin the exact size and type.

Bugs found by using it rather than reading it:

- A failed save wiped the whole form, because React resets form actions after submit. Forms now keep what
  was typed.
- On phones the admin content was pushed off-screen beside the navigation. The layout now stacks.
- Tailwind's `dark:` followed the operating system, not the site's own switch, so notices stayed light in
  dark mode. It now follows the switch.

Verified in a browser end to end: first-admin setup, login, a clip with a bad link (rejected, fields kept)
then a good one (live on the home page at once), a photo upload, trash, delete forever (files gone from R2),
an invite accepted by a second account, the same link refused on reuse, and the admin at phone width. All
test accounts and test content were removed afterwards.

---

## The site's shape, before any real content

The first build is the whole public site running on sample data, so the layout, navigation and themes can
be judged on a phone and a PC before a database exists.

**Pages** follow the reference archive: Home, Media, Polaroids, Music, Fanbase, Press and Socials, plus
Search, Credits & takedown and Privacy. Every placeholder item carries a dashed **sample** badge, so nobody
mistakes it for something real while the mods fill the archive in.

**Themes are two choices, not one.** Mode (Light / Dark / Auto) and color theme are picked separately, so
every theme works in both modes. Seven ship: five single-color (Bunny Pink, Lavender, Peach, Mint, Sky) and
two mixes (Dreamy, Sunset). Two decisions worth recording:

- **Hues, not hex.** A theme is up to three OKLCH hues; light and dark mode set the lightness and
  chroma. Because OKLCH lightness is perceptual, the contrast checks hold for every hue at once, and adding
  a theme is one line of CSS.
- **Presets, not a color picker.** A free picker lets one choice quietly make the text unreadable. Curated
  presets cannot.

**No flash on load.** A tiny inline script applies the saved theme before the first paint, so a visitor who
picked dark never sees a white page first.

**Video links cost nothing until pressed.** YouTube cards show a thumbnail and only load the player on
click, which keeps the media page fast on phones.

Verified in a browser: themes switched in both modes, the choice survived a reload, and the home, polaroid,
press and menu views were checked at phone width.
