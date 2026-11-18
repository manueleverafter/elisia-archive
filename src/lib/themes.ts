// Theme registry. Colors themselves live in globals.css as OKLCH tokens
// driven by up to three hues (--h, --h2, --h3). A theme here only needs
// an id, a label and swatch colors for the picker.

export type ThemeId =
  | "bunny"
  | "lavender"
  | "peach"
  | "mint"
  | "sky"
  | "dreamy"
  | "sunset";

export type Mode = "light" | "dark" | "system";

export const themes: {
  id: ThemeId;
  label: string;
  kind: "single" | "multi";
  swatch: string[];
}[] = [
  { id: "bunny", label: "Bunny Pink", kind: "single", swatch: ["oklch(0.72 0.17 355)"] },
  { id: "lavender", label: "Lavender", kind: "single", swatch: ["oklch(0.72 0.15 305)"] },
  { id: "peach", label: "Peach", kind: "single", swatch: ["oklch(0.76 0.14 45)"] },
  { id: "mint", label: "Mint", kind: "single", swatch: ["oklch(0.78 0.12 165)"] },
  { id: "sky", label: "Sky", kind: "single", swatch: ["oklch(0.74 0.12 235)"] },
  {
    id: "dreamy",
    label: "Dreamy",
    kind: "multi",
    swatch: ["oklch(0.74 0.16 355)", "oklch(0.72 0.15 305)", "oklch(0.76 0.12 235)"],
  },
  {
    id: "sunset",
    label: "Sunset",
    kind: "multi",
    swatch: ["oklch(0.72 0.17 5)", "oklch(0.77 0.14 50)", "oklch(0.84 0.13 85)"],
  },
];

export const THEME_KEY = "ea-theme";
export const MODE_KEY = "ea-mode";

/**
 * Runs inline in <head> before first paint so there is never a flash of
 * the wrong theme. Kept tiny and dependency-free on purpose.
 */
export const themeInitScript = `(function(){try{var d=document.documentElement,ids=${JSON.stringify(
  themes.map((t) => t.id),
)},t=localStorage.getItem("${THEME_KEY}"),m=localStorage.getItem("${MODE_KEY}")||"system";if(t&&ids.indexOf(t)>-1)d.setAttribute("data-theme",t);if(m==="system")m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.setAttribute("data-mode",m);d.style.colorScheme=m}catch(e){}})()`;
