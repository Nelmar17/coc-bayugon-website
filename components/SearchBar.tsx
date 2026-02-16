"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  CalendarDays,
  MapPin,
  GraduationCap,
} from "lucide-react";

/* ---------------- TYPES ---------------- */

type SearchType = "sermon" | "bibleStudy" | "event" | "directory";

type SearchResult = {
  id: number;
  title: string;
  type: SearchType;
  href: string;
};

type ApiResponse = {
  sermons: any[];
  bibleStudies: any[];
  events: any[];
  directory: any[];
};

/* ---------------- COMPONENT ---------------- */

export default function SearchBar() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  /* ---------------- CMD + K ---------------- */

    // 🔒 LOCK BODY SCROLL WHEN SEARCH IS OPEN (MOBILE)
    useEffect(() => {
      if (typeof window === "undefined") return;

      const isMobile = window.innerWidth < 768;

      if (open && isMobile) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }

      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------------- FOCUS ---------------- */

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  /* ---------------- CLICK OUTSIDE ---------------- */

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  /* ---------------- LIVE SEARCH ---------------- */

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);

      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data: ApiResponse = await res.json();

      const merged: SearchResult[] = [
        ...data.sermons.map((s) => ({
          id: s.id,
          title: s.title,
          type: "sermon" as const,
          href: `/sermons/${s.id}`,
        })),

        ...data.bibleStudies.map((b) => ({
          id: b.id,
          title: b.title,
          type: "bibleStudy" as const,
          href: `/bible-studies/${b.id}`,
        })),

        ...data.events.map((e) => ({
          id: e.id,
          title: e.title,
          type: "event" as const,
          href: `/events/${e.id}`,
        })),

        ...data.directory.map((d) => ({
          id: d.id,
          title: d.congregationName,
          type: "directory" as const,
          href: `/directory/${d.id}`,
        })),
      ];

      setResults(merged);
      setLoading(false);
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  /* ---------------- HELPERS ---------------- */

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };


const icon: Record<SearchType, React.ReactNode> = {
  sermon: <BookOpen className="w-4 h-4" />,
  bibleStudy: <GraduationCap className="w-4 h-4" />,
  event: <CalendarDays className="w-4 h-4" />,
  directory: <MapPin className="w-4 h-4" />,
};

  const highlight = (text: string) => {
    if (!query) return text;
    return text.split(new RegExp(`(${query})`, "gi")).map((p, i) =>
      p.toLowerCase() === query.toLowerCase() ? (
        <span
          key={i}
          className="bg-yellow-200 dark:bg-yellow-600/40 rounded px-0.5"
        >
          {p}
        </span>
      ) : (
        p
      )
    );
  };

const isMobile =
  typeof window !== "undefined" && window.innerWidth < 768;


  /* ---------------- RENDER ---------------- */

  return (
    <>
      {/* SEARCH ICON */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full hover:bg-blue-600/40 dark:hover:bg-blue-800/40 transition"
      >
        <Search className="w-5 h-5 text-slate-500 hover:text-slate-200 dark:text-slate-300" />
      </button>

      {/* COMMAND PALETTE */}
      {open && (
        <div className="fixed inset-0 z-[80]">
          <div
              ref={boxRef}
              className="
                fixed top-[72px] left-1/2 -translate-x-1/2
                w-[90%] max-w-xl
                rounded-2xl
                bg-white/60 dark:bg-slate-900/40
                backdrop-blur-2xl backdrop-saturate-150
                border border-white/20 dark:border-white/10
                shadow-[0_20px_50px_rgba(0,0,0,0.25)]
              "
            >
              {/* INPUT */}
              <div
                className="
                  flex items-center gap-3 px-4 py-3
                  rounded-xl
                  bg-white/30 dark:bg-slate-800/40
                  backdrop-blur-2xl
                  border border-white/20 dark:border-white/10
                  focus-within:ring-2 focus-within:ring-white/30
                "
              >
              <Search className="w-5 h-5 text-slate-500 dark:text-slate-300" />
              <input 
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isMobile ? "Search…" : "Search sermons, bible studies, events…"}
                className="
                  w-full bg-transparent outline-none text-base
                  text-slate-950 dark:text-slate-100
                  placeholder:text-slate-500 dark:placeholder:text-slate-400
                "
              />
              <kbd className="text-xs text-slate-400">ESC</kbd>
            </div>

            {/* RESULTS */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading && (
                <p className="px-4 py-3 text-sm text-slate-950 dark:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-white/10">
                  Searching…
                </p>
              )}

              {!loading && query && results.length === 0 && (
                <p className="px-4 py-3 text-sm text-slate-950 dark:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-white/10">
                  No results found.
                </p>
              )}

              {results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => go(r.href)}
                  className="
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  text-slate-950 dark:text-slate-100
                  hover:bg-slate-200/60 dark:hover:bg-white/10
                "
              >
                  <span className="text-slate-500">{icon[r.type]}</span>
                  <span className="flex-1 text-sm text-slate-900 dark:text-slate-100">
                    {highlight(r.title)}
                  </span>
                  <span className="text-xs uppercase text-slate-700 dark:text-slate-400">
                    {r.type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
