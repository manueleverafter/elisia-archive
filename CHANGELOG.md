# Changelog

What changed, and why. Newest first.

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
