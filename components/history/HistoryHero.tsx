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
    src: "/header-history/hd1-v2.jpg",
    duration: 6000,
    overlayClass: "bg-gradient-to-b from-black/50 via-black/30 to-black/70",
  },
  {
    src: "/header-history/hd2.jpg",
    duration: 7000,
    overlayClass: "bg-gradient-to-b from-slate-900/55 via-black/30 to-black/75",
  },
  {
    src: "/header-history/hd3.jpg",
    duration: 6000,
    overlayClass: "bg-gradient-to-b from-emerald-950/50 via-black/30 to-black/75",
  },
  {
    src: "/header-history/hd4.jpg",
    duration: 6000,
    overlayClass: "bg-gradient-to-b from-emerald-950/50 via-black/30 to-black/75",
  },
    {
    src: "/header-history/hd6.jpg",
    duration: 6000,
    overlayClass: "bg-gradient-to-b from-emerald-950/50 via-black/30 to-black/75",
  },
    {
    src: "/header-history/hd7.jpg",
    duration: 6000,
    overlayClass: "bg-gradient-to-b from-emerald-950/50 via-black/30 to-black/75",
  },
    {
    src: "/header-history/hd8.jpg",
    duration: 6000,
    overlayClass: "bg-gradient-to-b from-emerald-950/50 via-black/30 to-black/75",
  },
    {
    src: "/header-history/hd9.jpg",
    duration: 6000,
    overlayClass: "bg-gradient-to-b from-emerald-950/50 via-black/30 to-black/75",
  },
];

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HistoryHero() {
  const [order, setOrder] = useState<Slide[]>(SLIDES);
  const [index, setIndex] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offsetY, setOffsetY] = useState(0);

  /* swipe */
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);

  /* mount */
  useEffect(() => {
    setOrder(shuffle(SLIDES));
    setIndex(0);
  }, []);

  /* autoplay */
  useEffect(() => {
    clearTimeout(timerRef.current!);
    timerRef.current = setTimeout(goNext, order[index]?.duration ?? 6000);
    return () => clearTimeout(timerRef.current!);
  }, [index, order]);

  /* parallax */
  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth < 768) {
        setOffsetY(0);
        return;
      }
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const progress = Math.min(Math.max(rect.top / window.innerHeight, -1), 1);
      setOffsetY(progress * 28);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goNext = () => {
    setIndex((i) => (i + 1) % order.length);
  };

  const goPrev = () => {
    setIndex((i) => (i - 1 + order.length) % order.length);
  };

  /* swipe */
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
    if (deltaX.current < -60) goNext();
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
    >
      {/* SLIDES */}
      {order.map((slide, i) => (
        <div key={slide.src} className="absolute inset-0">
         <div
            className={clsx(
                "absolute inset-0 bg-cover bg-center transition-all duration-&lsqb;1200ms&rsqb;",
                i === index ? "opacity-100" : "opacity-0"
            )}
            style={{
                backgroundImage: `url(${slide.src})`,
                transform: `translateY(${offsetY}px) scale(${
                i === index ? 1.04 : 1.01
                })`,
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
        className="absolute z-30 left-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur transition"
      >
        <ChevronLeft size={22} />
      </button>

      {/* NEXT */}
      <button
        onClick={goNext}
        className="absolute z-30 right-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur transition"
      >
        <ChevronRight size={22} />
      </button>

      {/* DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {order.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={clsx(
              "h-2.5 w-2.5 rounded-full transition",
              i === index ? "bg-white" : "bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>
    </div>
  );
}
