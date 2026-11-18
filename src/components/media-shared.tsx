// Server-safe helpers shared by server and client components.
import type { Platform } from "@/lib/types";

export const platformLabel: Record<Platform, string> = {
  youtube: "YouTube",
  x: "X",
  tiktok: "TikTok",
  instagram: "Instagram",
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
