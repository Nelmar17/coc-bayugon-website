
"use client";

import Link from "next/link";
import { Clock, MapPin, Users, ChevronsRight, Home } from "lucide-react";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
} as const;

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

type WelcomeSectionProps = {
  congregationName: string;
  welcomeMessage?: string;
  bibleVerse?: string;
  bibleRef?: string;
  location?: string;
};

export default function WelcomeSection({
  congregationName,
  welcomeMessage,
  bibleVerse,
  bibleRef,
  location,
}: WelcomeSectionProps) {
  return (
    <section className="relative z-20 max-w-7xl mx-auto px-6 -mt-32 sm:-mt-32 pb-10 sm:pb-16">

        <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="
            relative
            rounded-3xl
            bg-white/60 dark:bg-slate-900/60
            backdrop-blur
            shadow-2xl
            ring-1 ring-black/5 dark:ring-white/10
            p-6 sm:p-10
            text-center
            space-y-6
        "
        >

        {/* ICON */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
            <Home className="w-6 h-6 text-blue-800 dark:text-blue-600" />
          </div>
        </div>

        {/* TITLE */}
        <header className="space-y-2">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100">
            Welcome to {congregationName}
            <span className="block pt-2">Church of Christ</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            A place of worship, faith, and Christian fellowship
          </p>
        </header>

        {/* MESSAGE */}
        {welcomeMessage && (
          <p className="text-lg leading-relaxed text-start max-w-5xl mx-auto py-8 text-slate-800 dark:text-slate-100">
            {welcomeMessage}
          </p>
        )}

        {/* QUICK FACTS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <Fact icon={<Clock className="w-5 h-5" />} label="Sunday Worship" />
          {location && (
            <Fact icon={<MapPin className="w-5 h-5" />} label={location} />
          )}
          <Fact icon={<Users className="w-5 h-5" />} label="All are welcome" />
        </div>

        {/* DIVIDER */}
        {(bibleVerse || bibleRef) && (
          <div className="flex justify-center py-2">
            <span className="h-px w-24 bg-blue-500/40" />
          </div>
        )}

        {/* VERSE */}
        {(bibleVerse || bibleRef) && (
          <blockquote className="italic text-slate-700 text-base dark:text-slate-300 max-w-3xl mx-auto">
            {bibleVerse && <>“{bibleVerse}”</>}
            {bibleRef && (
              <span className="block mt-2 not-italic text-base text-slate-600 dark:text-slate-400">
                — {bibleRef}
              </span>
            )}
          </blockquote>
        )}

        {/* CTA */}
        <div className="py-4">
          <Link
            href="/contact"
            className="
              inline-flex items-center gap-2
              rounded-full
              bg-blue-600 text-white font-semibold
              hover:bg-blue-700 transition
              px-6 py-3
              shadow-xl
            "
          >
            Let’s Connect
            <ChevronsRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------- SUB COMPONENT ---------- */
function Fact({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className="
        flex items-center gap-3 py-1
        justify-start sm:justify-center
        text-sm font-medium
        text-slate-800 dark:text-slate-200
      "
    >
      <span className="text-blue-600">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

