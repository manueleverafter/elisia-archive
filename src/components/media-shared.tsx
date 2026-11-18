// Server-safe helpers shared by server and client components.
import type { Platform } from "@/lib/types";

export const platformLabel: Record<Platform, string> = {
  youtube: "YouTube",
  x: "X",
  tiktok: "TikTok",
  instagram: "Instagram",
};

/** Display name and tint hue for each social platform. */
export const platformInfo: Record<string, { name: string; hue: number }> = {
  instagram: { name: "Instagram", hue: 350 },
  tiktok: { name: "TikTok", hue: 195 },
  x: { name: "X", hue: 260 },
  facebook: { name: "Facebook", hue: 255 },
  youtube: { name: "YouTube", hue: 25 },
  spotify: { name: "Spotify", hue: 150 },
  weverse: { name: "Weverse", hue: 175 },
};

/** Theme-tinted placeholder used until a real image exists. */
export function Placeholder({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`bg-gradient grid place-items-center overflow-hidden ${className}`}>
      <span aria-hidden className="text-5xl opacity-70 drop-shadow">
        🐰
      </span>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
