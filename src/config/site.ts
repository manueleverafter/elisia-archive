// Central place for site identity. Change the name, tagline or fandom
// wording here and it updates everywhere. (Later, mods will be able to
// edit these from the admin panel.)

export const siteConfig = {
  name: "elisia archive",
  shortName: "elisia archive",
  tagline: "a cozy burrow for our bunny, kept by the elysian fortress",
  description:
    "Unofficial fan archive for Elisia: videos, polaroids, music, press and fanbase updates, curated by the Elysian Fortress (ELFORT).",
  idol: {
    name: "Elisia",
    nicknames: ["Bunny", "Elmandu"],
    favoriteColor: "pink",
  },
  fandom: {
    name: "Elysian Fortress",
    shortName: "ELFORT",
    greeting: "hi elforts!",
  },
  /** Theme every new visitor sees until they pick their own. */
  defaultTheme: "bunny" as const,
  nav: [
    { href: "/", label: "Home" },
    { href: "/media", label: "Media" },
    { href: "/photos", label: "Polaroids" },
    { href: "/music", label: "Music" },
    { href: "/updates", label: "Fanbase" },
    { href: "/press", label: "Press" },
    { href: "/socials", label: "Socials" },
  ],
} as const;
