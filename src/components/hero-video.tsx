"use client";

import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

// Minimal typing for the bits of the YouTube IFrame API we use.
type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(s: number, allowSeekAhead: boolean): void;
  mute(): void;
  unMute(): void;
  setVolume(v: number): void;
  destroy(): void;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: { onReady?: () => void; onStateChange?: (e: { data: number }) => void };
    },
  ) => YTPlayer;
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;
function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT!);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  });
  return apiPromise;
}

const PLAYING = 1;
const noopSubscribe = () => () => {};

/**
 * Home hero with the featured YouTube clip playing silently behind the text.
 * Starts muted (browsers block autoplay with sound), shows the thumbnail
 * until the video is actually playing, pauses when scrolled away, and
 * respects "reduce motion" by waiting for the visitor to press play.
 */
export function HeroVideo({
  youtubeId,
  title,
  poster,
  children,
}: {
  youtubeId: string;
  title: string;
  poster: ReactNode;
  children: ReactNode;
}) {
  const section = useRef<HTMLElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const userPaused = useRef(false);
  // Autoplay unless the visitor asked for less motion or is saving data.
  const autoplayOk = useSyncExternalStore(
    noopSubscribe,
    () =>
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
    () => false,
  );
  const [userStarted, setStarted] = useState(false);
  const started = autoplayOk || userStarted; // player requested
  const [visible, setVisible] = useState(false); // video frames showing
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!started || !mount.current) return;
    let cancelled = false;
    // The API replaces the element it's given with an iframe, so hand it a
    // child we create ourselves rather than a node React manages.
    const host = document.createElement("div");
    mount.current.appendChild(host);
    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      player.current = new YT.Player(host, {
        videoId: youtubeId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          loop: 1,
          playlist: youtubeId,
          playsinline: 1,
          rel: 0,
          disablekb: 1,
          iv_load_policy: 3,
          fs: 0,
        },
        events: {
          onReady: () => {
            player.current?.mute();
            player.current?.playVideo();
          },
          onStateChange: (e) => {
            const isPlaying = e.data === PLAYING;
            setPlaying(isPlaying);
            if (isPlaying) setVisible(true);
          },
        },
      });
    });
    return () => {
      cancelled = true;
      player.current?.destroy();
      player.current = null;
      host.remove();
    };
  }, [started, youtubeId]);

  // Pause while the hero is off-screen; resume when it comes back.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      const p = player.current;
      if (!p) return;
      if (!entry.isIntersecting) p.pauseVideo();
      else if (!userPaused.current) p.playVideo();
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const togglePlay = () => {
    if (!started) {
      setStarted(true);
      return;
    }
    const p = player.current;
    if (!p) return;
    if (playing) {
      userPaused.current = true;
      p.pauseVideo();
    } else {
      userPaused.current = false;
      p.playVideo();
    }
  };
  const restart = () => {
    userPaused.current = false;
    player.current?.seekTo(0, true);
    player.current?.playVideo();
  };
  const toggleSound = () => {
    if (!started) setStarted(true);
    const p = player.current;
    if (!p) return;
    if (muted) {
      p.unMute();
      p.setVolume(70);
    } else p.mute();
    setMuted(!muted);
  };

  const btn =
    "grid size-11 place-items-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur transition hover:bg-black/65";

  return (
    <section ref={section} className="relative isolate flex min-h-[78svh] items-end overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {poster}
        {started && (
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-1000 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Oversized and centered so the 16:9 video always covers the hero */}
            <div
              ref={mount}
              className="absolute top-1/2 left-1/2 h-[max(100%,56.25vw)] w-[max(100%,177.78svh)] -translate-x-1/2 -translate-y-1/2 [&_iframe]:size-full"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
      </div>

      {children}

      <div
        role="group"
        aria-label={`Background video: ${title}`}
        className="absolute top-4 right-4 z-10 flex gap-2 sm:top-auto sm:right-6 sm:bottom-6"
      >
        {started && (
          <button type="button" onClick={restart} aria-label="Play from the start" className={btn}>
            <RotateCcw className="size-[18px]" />
          </button>
        )}
        <button type="button" onClick={togglePlay} aria-label={playing ? "Pause video" : "Play video"} className={btn}>
          {playing ? <Pause className="size-[18px] fill-current" /> : <Play className="ml-0.5 size-[18px] fill-current" />}
        </button>
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          className={`${btn} w-auto gap-2 px-4 text-sm font-semibold`}
        >
          <span className="flex items-center gap-2">
            {muted ? <VolumeX className="size-[18px]" /> : <Volume2 className="size-[18px]" />}
            {muted ? "sound off" : "sound on"}
          </span>
        </button>
      </div>
    </section>
  );
}
