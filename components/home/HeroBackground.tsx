"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  src: string;
  duration: number;
  overlayClass?: string;
};

const SLIDES: Slide[] = [
  {
    src: "/main-header1.jpg",
    duration: 5000,
    overlayClass: "bg-gradient-to-b from-black/65 via-black/35 to-black/70",
  },
  {
    src: "/main-header2.jpg",
    duration: 7000,
    overlayClass: "bg-gradient-to-b from-slate-900/60 via-black/30 to-black/75",
  },
  {
    src: "/main-header3.jpg",
    duration: 6000,
    overlayClass: "bg-gradient-to-b from-emerald-950/55 via-black/30 to-black/75",
  },
  {
    src: "/main-header4.jpg",
    duration: 6000,
    overlayClass: "bg-gradient-to-b from-emerald-950/55 via-black/30 to-black/75",
  },
   {
    src: "/main-header5.jpg",
    duration: 6000,
    overlayClass: "bg-gradient-to-b from-emerald-950/55 via-black/30 to-black/75",
  },
   {
    src: "/main-header6.jpg",
    duration: 6000,
    overlayClass: "bg-gradient-to-b from-emerald-950/55 via-black/30 to-black/75",
  },
];

/* shuffle safely (client only) */
function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HeroBackground() {
  const [order, setOrder] = useState<Slide[]>(SLIDES);
  const [index, setIndex] = useState(0);

  // const timerRef = useRef<NodeJS.Timeout | null>(null);
  // const hideArrowTimer = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideArrowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasMounted = useRef(false);

  /* arrows state */
  const [showArrows, setShowArrows] = useState(true);
  const [paused, setPaused] = useState(false);

  /* swipe */
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offsetY, setOffsetY] = useState(0);

  const isMobile =
  typeof window !== "undefined" && window.innerWidth < 768;


  useEffect(() => {
  const current = order[index]?.src;
  const next = order[(index + 1) % order.length]?.src;

  if (current) ensureLoaded(current);
  if (next) ensureLoaded(next);
}, [index, order]);


useEffect(() => {
  const onScroll = () => {
    // ✅ Disable parallax on mobile
    if (window.innerWidth < 768) {
      setOffsetY(0);
      return;
    }

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const progress = Math.min(
      Math.max(rect.top / window.innerHeight, -1),
      1
    );

    // 👉 PUMILI LANG NG ISA
    setOffsetY(progress * 25); // SOFTER 
    // setOffsetY(progress * 60); // STRONGER
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  return () => window.removeEventListener("scroll", onScroll);
}, []);


  /* mount shuffle (hydration safe) */
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      setOrder(shuffle(SLIDES));
      setIndex(0);
    }
  }, []);

  /* autoplay */
  useEffect(() => {
    if (paused) return;

    clearTimeout(timerRef.current!);
    timerRef.current = setTimeout(() => {
      goNext(true);
    }, order[index]?.duration ?? 6000);

    return () => clearTimeout(timerRef.current!);
  }, [index, order, paused]);


    const ensureLoaded = (src: string) => {
    if (loaded.has(src)) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
        setLoaded((prev) => new Set(prev).add(src));
    };
    };

  const goNext = (auto = false) => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= order.length) {
        setOrder(shuffle(SLIDES));
        return 0;
      }
      return next;
    });
    if (!auto) resetMobileArrowTimer();
  };

  const goPrev = () => {
    setIndex((i) => (i - 1 + order.length) % order.length);
    resetMobileArrowTimer();
  };

  /* keyboard support */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* mobile auto-hide arrows */
const resetMobileArrowTimer = () => {
  if (!isMobile) return;

  setShowArrows(true);

  if (hideArrowTimer.current) {
    clearTimeout(hideArrowTimer.current);
  }

  hideArrowTimer.current = setTimeout(() => {
    setShowArrows(false);
  }, 2500);
};

  /* swipe handlers */
  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    deltaX.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    deltaX.current = e.clientX - startX.current;
  };

  const onPointerUp = () => {
    if (deltaX.current > 60) goPrev();
    else if (deltaX.current < -60) goNext();
    startX.current = null;
    deltaX.current = 0;
  };

  return (
    <div
      ref={containerRef}
  className="absolute inset-0 overflow-hidden group"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      aria-live="polite"
    >
      {/* Slides */}
      {order.map((slide, i) => (
        <div key={slide.src} className="absolute inset-0">
          <div
          className={clsx(
            "absolute inset-0 bg-cover bg-center transition-all duration-&lsqb;1200ms&rsqb; will-change-transform",
            i === index ? "opacity-100 scale-110" : "opacity-0 scale-105"
          )}
          style={{
            backgroundImage: loaded.has(slide.src)
              ? `url(${slide.src})`
              : "none",
            transform: `translateY(${offsetY}px) scale(${i === index ? 1.1 : 1.05})`,
          }}

          />
          <div
            className={clsx(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "opacity-100" : "opacity-0",
              slide.overlayClass
            )}
          />
        </div>
      ))}

      {/* PREV */}
      <button
        onClick={goPrev}
       onPointerDown={() => {
            if (isMobile) resetMobileArrowTimer();
            else setPaused(true);
          }}
          onPointerUp={() => {
            if (!isMobile) setPaused(false);
          }}

        className={clsx(
          `
          absolute z-20
          top-1/2 left-4 -translate-y-1/2
          md:left-16
          h-10 w-10 rounded-full
          bg-black/40 hover:bg-black/60
          backdrop-blur border border-white/20
          text-white flex items-center justify-center
          transition
          `,
          showArrows
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none md:visible md:pointer-events-auto md:group-hover:opacity-100"

        )}

        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>

      {/* NEXT */}
      <button
        onClick={() => goNext()}
        onPointerDown={() => {
          if (isMobile) resetMobileArrowTimer();
          else setPaused(true);
        }}
        onPointerUp={() => {
          if (!isMobile) setPaused(false);
        }}
        className={clsx(
          `
          absolute z-20
          top-1/2 right-4 -translate-y-1/2
          md:right-16
          h-10 w-10 rounded-full
          bg-black/40 hover:bg-black/60
          backdrop-blur border border-white/20
          text-white flex items-center justify-center
          transition
          `,
         showArrows
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none md:visible md:pointer-events-auto md:group-hover:opacity-100"
        )}

        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* DOTS */}
      <div
        className="
          absolute
          bottom-48 sm:bottom-36 md:bottom-36
          left-1/2 -translate-x-1/2
          flex gap-2 z-20

          /* LAPTOP 14–16 INCH ONLY */
          [@media(min-width:1024px)_and_(max-width:1440px)_and_(max-height:900px)]:bottom-24
        "
      >
        {order.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={clsx(
              `
              rounded-full transition

              h-2 w-2

              /* LAPTOP 14–16 INCH ONLY */
              [@media(min-width:1024px)_and_(max-width:1440px)_and_(max-height:900px)]:h-1.5
              [@media(min-width:1024px)_and_(max-width:1440px)_and_(max-height:900px)]:w-1.5
              `,
              i === index
                ? "bg-blue-800 dark:bg-blue-700"
                : "bg-white/40 dark:bg-white/40"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
  
}
