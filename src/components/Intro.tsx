import { useEffect, useState, useCallback } from "react";

const LEAVE_AT = 2800;
const DONE_AT = 3500;

// Session-level flag in memory
let playedThisSession = false;

export function Intro() {
  const [phase, setPhase] = useState<"hidden" | "play" | "leave" | "done">("hidden");

  const finish = useCallback(() => {
    setPhase("done");
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let alreadyPlayed = false;
    try {
      alreadyPlayed =
        playedThisSession ||
        Boolean(sessionStorage.getItem("rs-intro-played")) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      alreadyPlayed = playedThisSession;
    }

    if (alreadyPlayed) {
      setPhase("done");
      return;
    }

    playedThisSession = true;
    try {
      sessionStorage.setItem("rs-intro-played", "1");
    } catch {}

    setPhase("play");
    document.body.style.overflow = "hidden";

    const t1 = setTimeout(() => {
      setPhase("leave");
    }, LEAVE_AT);

    const t2 = setTimeout(() => {
      finish();
    }, DONE_AT);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearTimeout(t1);
        clearTimeout(t2);
        finish();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [finish]);

  if (phase === "hidden" || phase === "done") return null;

  return (
    <div
      aria-hidden
      onClick={finish}
      className={`fixed inset-0 z-[100] flex flex-col bg-ink text-cream overflow-hidden cursor-pointer select-none ${
        phase === "leave" ? "intro-leave" : "intro-enter"
      }`}
    >
      {/* Skip button top right */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
        className="absolute top-6 right-6 z-10 rounded-full border border-cream/30 bg-ink/60 px-3 py-1 text-xs font-semibold text-cream/80 hover:text-cream hover:border-cream transition cursor-pointer"
        aria-label="Skip intro"
      >
        skip ✕
      </button>

      {/* spinning star, top right */}
      <span className="intro-star absolute top-8 right-24 text-lime text-5xl md:text-7xl select-none pointer-events-none">✺</span>
      <span className="absolute bottom-24 left-10 text-pink text-3xl select-none opacity-80 pointer-events-none">✺</span>
      <span className="absolute top-1/3 left-[12%] text-sun text-xl select-none opacity-70 pointer-events-none">✺</span>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p className="intro-pill mb-8 rounded-full border-2 border-cream/40 px-4 py-1.5 text-[11px] md:text-xs font-bold uppercase tracking-[0.25em] text-lime">
          made in india, obviously
        </p>
        <h1 className="leading-[0.9]">
          <span className="block overflow-hidden pb-1">
            <span className="intro-word-1 block font-display text-7xl md:text-[9rem] font-extrabold tracking-tighter text-cream">
              rarely
            </span>
          </span>
          <span className="block overflow-hidden pb-2">
            <span className="intro-word-2 block font-serif italic font-normal text-7xl md:text-[9rem] leading-[0.9] text-pink">
              seen
            </span>
          </span>
        </h1>
        <p className="intro-tag mt-8 max-w-2xl text-2xl md:text-3xl text-cream font-bold uppercase tracking-[0.15em] leading-snug">
          All Indian Homegrown Brands in <span className="text-lime">One Place</span>
        </p>
      </div>

      {/* progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-cream/10">
        <div className="intro-bar h-full w-full bg-lime origin-left" />
      </div>
    </div>
  );
}
