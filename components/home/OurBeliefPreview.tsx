"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseBeliefs, ParsedBelief } from "@/lib/parseBeliefs";
import { ChevronsRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

async function getData() {
  const res = await fetch("/api/who-we-are", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load belief");
  return res.json();
}

export default function OurBeliefPreview() {
  const [beliefs, setBeliefs] = useState<ParsedBelief[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    getData().then((data) => {
      const parsed = parseBeliefs(data.belief || "");
      setBeliefs(parsed);
      setActiveSlug(parsed[0]?.slug ?? null);
    });
  }, []);

  if (!beliefs.length) return null;

  const active = beliefs.find((b) => b.slug === activeSlug);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      {/* HEADER */}
      <header className="text-center mb-14 space-y-6">
        <h2 className="text-4xl font-bold">
          Foundational Beliefs of the Church of Christ
        </h2>
        <p className="max-w-4xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Explore the core principles that shape our Scripture-based faith.
        </p>
      </header>

      {/* ================= MOBILE: ACCORDION ================= */}
      <div className="md:hidden space-y-3">
        {beliefs.map((b) => {
          const isOpen = activeSlug === b.slug;

          return (
            <div
              key={b.slug}
              className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              {/* HEADER */}
              <button
                onClick={() =>
                  setActiveSlug(isOpen ? null : b.slug)
                }
                className="w-full flex items-center justify-between px-4 py-4 text-left bg-white dark:bg-slate-950"
              >
                <span className="font-semibold text-base">
                  {b.title}
                </span>

                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.span>
              </button>

              {/* CONTENT */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-4 pb-4 pt-4 space-y-3 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400"
                  >
                    {b.subtitle && (
                      <p className="italic font-medium text-slate-700 dark:text-slate-300">
                        {b.subtitle}
                      </p>
                    )}

                    <p className="whitespace-pre-line text-base">
                      {b.body}
                    </p>

                    <Link
                      href={`/about/who-we-are/our-belief#${b.slug}`}
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-600"
                    >
                      Learn more <ChevronsRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ================= DESKTOP: CURRENT LAYOUT ================= */}
      <div className="hidden md:grid md:grid-cols-3 gap-12">
        {/* LEFT – NAV */}
        <div className="space-y-2">
          {beliefs.map((b) => (
            <button
              key={b.slug}
              onClick={() => setActiveSlug(b.slug)}
              className={`w-full text-left rounded-xl px-4 py-3 border transition
                ${
                  activeSlug === b.slug
                    ? "border-blue-950 bg-blue-950 text-white dark:bg-blue-900/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-blue-600 hover:dark:border-blue-600 hover:text-white hover:bg-blue-900 dark:hover:bg-blue-800"
                }`}
            >
              <span className="font-semibold">{b.title}</span>
            </button>
          ))}
        </div>

        {/* RIGHT – PREVIEW */}
        {active && (
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-2xl font-bold">{active.title}</h3>

            {active.subtitle && (
              <p className="italic text-lg text-slate-700 dark:text-slate-300">
                {active.subtitle}
              </p>
            )}

            <p className="text-lg text-slate-600 dark:text-slate-400 line-clamp-4 whitespace-pre-line">
              {active.body}
            </p>

            <Link
              href={`/about/who-we-are/our-belief#${active.slug}`}
              className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-600"
            >
              Learn more <ChevronsRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
