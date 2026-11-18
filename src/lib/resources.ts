// Admin content definitions. Each resource lists its fields once, and the
// admin list, form, validation and trash are all generated from this.
// Pure data: safe to import from client and server.

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "date"
  | "select"
  | "tags"
  | "number"
  | "boolean"
  | "links"
  | "image";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export type ResourceDef = {
  key: ResourceKey;
  label: string; // plural, for nav
  singular: string;
  titleField: string;
  dateField?: string;
  fields: Field[];
  defaultSort: Record<string, 1 | -1>;
};

export type ResourceKey = "media" | "polaroids" | "releases" | "posts" | "ads" | "press" | "socials";

const opts = (...pairs: [string, string][]) => pairs.map(([value, label]) => ({ value, label }));

export const resources: Record<ResourceKey, ResourceDef> = {
  media: {
    key: "media",
    label: "Media",
    singular: "clip",
    titleField: "title",
    dateField: "date",
    defaultSort: { date: -1 },
    fields: [
      {
        name: "url",
        label: "Link",
        type: "url",
        required: true,
        help: "YouTube, X, TikTok or Instagram link. The platform is detected automatically.",
        placeholder: "https://www.youtube.com/watch?v=…",
      },
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: opts(
          ["mv", "Music video"],
          ["performance", "Performance"],
          ["variety", "Variety"],
          ["live", "Live"],
          ["fancam", "Fancam"],
          ["behind", "Behind the scenes"],
        ),
      },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "tags", label: "Tags", type: "tags", help: "Separate with commas, e.g. stage, debut" },
      { name: "description", label: "Short description", type: "textarea" },
      {
        name: "featured",
        label: "Feature on the home page",
        type: "boolean",
        help: "The newest featured clip becomes the big video at the top of the home page.",
      },
    ],
  },
  polaroids: {
    key: "polaroids",
    label: "Polaroids",
    singular: "polaroid",
    titleField: "caption",
    dateField: "date",
    defaultSort: { date: -1 },
    fields: [
      { name: "image", label: "Photo", type: "image", required: true },
      { name: "caption", label: "Caption", type: "text", required: true },
      { name: "credit", label: "Credit", type: "text", required: true, placeholder: "@fansite_name" },
      { name: "creditUrl", label: "Credit link", type: "url", help: "Link to the original post, if any." },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "tags", label: "Tags", type: "tags" },
    ],
  },
  releases: {
    key: "releases",
    label: "Music",
    singular: "release",
    titleField: "title",
    dateField: "date",
    defaultSort: { date: -1 },
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "type",
        label: "Type",
        type: "select",
        required: true,
        options: opts(["single", "Single"], ["album", "Album"], ["ost", "OST"], ["group", "Group release"]),
      },
      { name: "date", label: "Release date", type: "date", required: true },
      { name: "cover", label: "Cover art", type: "image" },
      { name: "links", label: "Streaming links", type: "links", help: "Spotify, Apple Music, YouTube…" },
      { name: "goalLabel", label: "Streaming goal name", type: "text", placeholder: "MV views" },
      { name: "goalCurrent", label: "Goal: current count", type: "number" },
      { name: "goalTarget", label: "Goal: target", type: "number" },
    ],
  },
  posts: {
    key: "posts",
    label: "Fanbase",
    singular: "post",
    titleField: "title",
    dateField: "date",
    defaultSort: { pinned: -1, date: -1 },
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body", label: "Message", type: "textarea", required: true },
      {
        name: "tag",
        label: "Type",
        type: "select",
        required: true,
        options: opts(
          ["announcement", "Announcement"],
          ["project", "Fan project"],
          ["event", "Event"],
          ["notice", "Notice"],
        ),
      },
      {
        name: "link",
        label: "Link (optional)",
        type: "url",
        help: "If set, tapping the post opens this, e.g. an X post, a voting guide or a form.",
      },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "pinned", label: "Pin as a fan note (top of Fanbase and the home page)", type: "boolean" },
    ],
  },
  ads: {
    key: "ads",
    label: "Fan ads",
    singular: "ad",
    titleField: "location",
    dateField: "date",
    defaultSort: { date: -1 },
    fields: [
      {
        name: "location",
        label: "Where",
        type: "text",
        required: true,
        placeholder: "South Korea",
        help: "City or country. Shown as “Aug · South Korea”.",
      },
      { name: "date", label: "Date", type: "date", required: true, help: "Month and year are shown." },
      {
        name: "url",
        label: "Link",
        type: "url",
        required: true,
        help: "The X / Instagram post showing the ad.",
      },
      { name: "note", label: "Note (optional)", type: "text", placeholder: "Birthday billboard, Gangnam station" },
    ],
  },
  press: {
    key: "press",
    label: "Press",
    singular: "article",
    titleField: "headline",
    dateField: "date",
    defaultSort: { date: -1 },
    fields: [
      { name: "headline", label: "Headline", type: "text", required: true },
      { name: "url", label: "Article link", type: "url", required: true },
      { name: "outlet", label: "Outlet", type: "text", required: true, placeholder: "Rappler" },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "era", label: "Era", type: "text", placeholder: "Debut era" },
      {
        name: "mention",
        label: "Coverage",
        type: "select",
        required: true,
        options: opts(["feature", "Feature (about her)"], ["interview", "Interview"], ["mention", "Mention"]),
      },
    ],
  },
  socials: {
    key: "socials",
    label: "Socials",
    singular: "link",
    titleField: "label",
    defaultSort: { order: 1, label: 1 },
    fields: [
      { name: "label", label: "Name", type: "text", required: true, placeholder: "Elisia on Instagram" },
      { name: "handle", label: "Handle", type: "text", required: true, placeholder: "@handle" },
      { name: "url", label: "Link", type: "url", required: true },
      {
        name: "platform",
        label: "Platform",
        type: "select",
        required: true,
        options: opts(
          ["instagram", "Instagram"],
          ["x", "X"],
          ["tiktok", "TikTok"],
          ["youtube", "YouTube"],
          ["facebook", "Facebook"],
          ["spotify", "Spotify"],
          ["weverse", "Weverse"],
        ),
      },
      {
        name: "owner",
        label: "Group",
        type: "select",
        required: true,
        options: opts(
          ["official", "Official: Elisia"],
          ["group", "Official: group"],
          ["fanbase", "ELFORT: community account"],
          ["project", "ELFORT: fan project"],
          ["website", "ELFORT: website"],
        ),
      },
      { name: "order", label: "Sort order", type: "number", help: "Lower numbers show first." },
    ],
  },
};

export const resourceList = Object.values(resources);

export function isResourceKey(k: string): k is ResourceKey {
  return k in resources;
}

/** Detects platform and YouTube id from a pasted link. */
export function parseMediaUrl(
  url: string,
): { platform: "youtube" | "x" | "tiktok" | "instagram" | null; youtubeId?: string } {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { platform: null };
  }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") return { platform: "youtube", youtubeId: u.pathname.slice(1, 12) };
  if (host.endsWith("youtube.com")) {
    const id =
      u.searchParams.get("v") ?? u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1] ?? undefined;
    return { platform: "youtube", youtubeId: id ?? undefined };
  }
  if (host === "x.com" || host === "twitter.com") return { platform: "x" };
  if (host.endsWith("tiktok.com")) return { platform: "tiktok" };
  if (host.endsWith("instagram.com")) return { platform: "instagram" };
  return { platform: null };
}
