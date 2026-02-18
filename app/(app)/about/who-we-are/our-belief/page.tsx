"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Circle, Info, ChevronRight, ChevronDown } from "lucide-react";

/* =========================
   FETCH
   ========================= */
async function getData() {
  const res = await fetch("/api/who-we-are", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load belief");
  return res.json();
}

/* =========================
   PAGE
   ========================= */
export default function OurBeliefPage() {
  const [beliefText, setBeliefText] = useState("");

  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const hasScrolledRef = useRef(false);

  const [open, setOpen] = useState(false);

  // const ignoreScrollRef = useRef(false);

  // para ma-scroll sa active item sa dropdown
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    getData().then((data) => {
      setBeliefText(data.belief || "");
    });
  }, []);

  useEffect(() => {
  if (!open || !activeSlug) return;

  const el = itemRefs.current[activeSlug];
  if (el) {
    el.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
  }
}, [open, activeSlug]);

useEffect(() => {
  setOpen(false);
}, [activeSlug]);


  const beliefs = useMemo(() => {
    return beliefText
      .split("•")
      .map((b) => b.trim())
      .filter(Boolean)
      .map((raw) => {
        // Remove scripture block
        const scriptureMatch = raw.match(/\(([^)]+)\)\s*$/);

        const scriptures = scriptureMatch
          ? scriptureMatch[1]
              .split(";")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        const withoutScripture = raw.replace(/\(([^)]+)\)\s*$/, "").trim();

        // Split lines
        const lines = withoutScripture
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        const title = lines[0] || ""; // THE TRIUNE GOD
        const subtitle = lines[1] || ""; // We Believe God Existed...
        const body = lines.slice(2).join("\n");

        return {
                title,
                subtitle,
                body,
                scriptures,
                slug: title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, ""),
              };

      });
  }, [beliefText]);

  useEffect(() => {
    if (!beliefs.length) return;

    const hash = window.location.hash;
    if (!hash) return;

    const slug = hash.replace("#", "");
    setActiveSlug(slug);

    const el = document.getElementById(slug);
      if (el && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [beliefs]);


    useEffect(() => {
    if (!beliefs.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const slug = entry.target.id;
            setActiveSlug(slug);

            // Update URL without scrolling
            window.history.replaceState(
              null,
              "",
              `#${slug}`
            );
          }
        });
      },
      {
        rootMargin: "-120px 0px -60% 0px",
        threshold: 0.2,
      }
    );

    beliefs.forEach((b) => {
      const el = document.getElementById(b.slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [beliefs]);

  return (

    <div className="min-h-screen bg-white dark:bg-slate-950">
       <section className="max-w-7xl space-y-16 mx-auto px-4 pb-24 pt-[100px]">

       {/* BREADCRUMBS */}
         <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {/* <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-blue-600 transition"
            >
            <Home className="w-4 h-4" />
             Home
            </Link>
      
            <ChevronRight className="w-4 h-4" /> */}

            <Info className="w-4 h-4" /> 
      
            <Link
            href="/about"
            className="hover:text-blue-600 transition"
            >
             About
            </Link>
                      
            <ChevronRight className="w-4 h-4" />
      
            <Link
            href="/about/who-we-are"
            className="hover:text-blue-600 transition"
            >
             Who We Are
            </Link>
      
           <ChevronRight className="w-4 h-4" />

           <span className="font-medium text-slate-900 dark:text-white">
            Our Belief
          </span>
         </nav>

      {/* PAGE HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-3 text-center "
      >
        <h1 className="text-4xl font-bold ">Our Belief</h1>
        <p className="italic text-lg md:text-lg text-slate-700 dark:text-slate-400">
          Based On Christ’s Name (authority, Jn. 20:30–31)
        </p>
      </motion.header>


      {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
      />
    )}

{/* MOBILE BELIEF DROPDOWN */}
<div className="lg:hidden z-40 sticky top-20 bg-background pb-3">
  {/* TOGGLE BUTTON */}
  <button
    type="button"
    onClick={() => setOpen((v) => !v)}
    className="w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm
      bg-background border-slate-300 dark:border-slate-700
      focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <span className="truncate">
      {beliefs.find((b) => b.slug === activeSlug)?.title ||
        "Select a belief…"}
    </span>

    {/* CHEVRON */}
    <motion.span
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <ChevronDown className="w-4 h-4" />
    </motion.span>
  </button>

  {/* DROPDOWN PANEL */}
  <motion.div
    initial={false}
    animate={open ? "open" : "closed"}
    variants={{
      open: { opacity: 1, y: 0, pointerEvents: "auto" },
      closed: { opacity: 0, y: -12, pointerEvents: "none" },
    }}
    transition={{
      type: "spring",
      stiffness: 420,
      damping: 32,
    }}
    className="fixed left-4 right-4 top-[calc(5rem+3.5rem)]
      z-40 max-h-[60vh] overflow-auto
      rounded-xl border bg-background shadow-xl"
  >
    {beliefs.map((b) => {
      const isActive = activeSlug === b.slug;

      return (
        <motion.button
          key={b.slug}
          ref={(el) => {
            itemRefs.current[b.slug] = el;
          }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setActiveSlug(b.slug);
            setOpen(false);

            document
              .getElementById(b.slug)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className={`w-full text-left px-4 py-3 text-sm transition
            ${
              isActive
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
        >
          {b.title}
        </motion.button>
      );
    })}
  </motion.div>
</div>

      {/* BELIEFS */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12">

          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-1">
              {beliefs.map((b) => {
                const isActive = activeSlug === b.slug;

                return (
              <button
                  type="button"
                  key={b.slug}
                  onClick={() => {
                    setActiveSlug(b.slug);
                    document
                      .getElementById(b.slug)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`relative w-full text-left px-5 py-3 rounded-xl text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:text-blue-500 dark:bg-blue-900/30"
                        : "text-slate-700 dark:text-slate-200 hover:bg-sky-100 dark:hover:bg-blue-950"
                    }`}
                >
                  {/* ANIMATED ACTIVE INDICATOR */}
                  {isActive && (
                    <motion.span
                      layoutId="belief-indicator"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-blue-600"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                      }}
                    />
                  )}

                  <span className="block leading-snug pl-3">
                    {b.title}
                  </span>
                </button>
                );
              })}
            </div>
          </aside>

      <div className="space-y-12">
        {beliefs.map((b, index) => (
            <motion.article
                id={b.slug}
                key={b.slug}
                // key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                animate={{
                  opacity: activeSlug && activeSlug !== b.slug ? 0.45 : 1,
                }}
                className="scroll-mt-[72px] rounded-2xl border bg-background px-10 py-9 shadow-lg space-y-6 border-blue-400/20 bg-white dark:bg-slate-950/60 transition-opacity"
              >

            {/* MAIN HEADER */}
            <div className="flex items-start gap-3 mb-3">
              <Circle className="mt-2 h-2.5 w-2.5 fill-current text-slate-900 dark:text-slate-100 shrink-0" />
              <h2 className="text-2xl font-bold uppercase tracking-wide">
                {b.title}
              </h2>
            </div>

            {/* SUB HEADER */}
            {b.subtitle && (
              <p className="mb-3 text-lg md:text-lg font-semibold italic text-slate-800 dark:text-slate-200">
                {b.subtitle}
              </p>
            )}

            {/* BODY */}
            {b.body && (
              <p className="leading-relaxed text-lg md:text-lg text-slate-800 dark:text-slate-200 whitespace-pre-line">
                {b.body}
              </p>
            )}

            {/* SCRIPTURES */}
            {b.scriptures.length > 0 && (
              <div className="mt-6 space-y-3">
                <p className="text-lg font-semibold">
                  Scriptural Foundation
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-2">
                  {b.scriptures.map((verse, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-lg md:text-lg text-slate-800 dark:text-slate-200"
                    >
                      <BookOpen className="h-4 w-4 mt-1.5 shrink-0 text-black dark:text-white" />
                      <span>{verse}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  </div>
  );
}
