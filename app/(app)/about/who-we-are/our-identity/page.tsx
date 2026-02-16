"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Info, ChevronRight} from "lucide-react";


async function getData() {
  const res = await fetch("/api/who-we-are", { cache: "no-store" });
  return res.json();
}

export default function OurIdentityPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getData().then(setData);
  }, []);

    useEffect(() => {
  window.scrollTo({ top: 0, behavior: "instant" });
}, []);

    useEffect(() => {
  window.scrollTo({ top: 0, behavior: "instant" });
}, []);

  if (!data) return null;

  const items = data.identity
    .split("•")
    .map((i: string) => i.trim())
    .filter(Boolean);

  return (

    <section className="max-w-6xl mx-auto pt-[100px] px-4 py-16 space-y-12">

      {/* BREADCRUMBS */}
         <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        
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
            Our Identity
          </span>
         </nav>

      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-3"
      >
        <h1 className="text-4xl font-bold">Our Identity</h1>
        <p className="italic text-slate-600 dark:text-slate-400">
          By Identifying Marks Of The Church (Matt. 7:21–23)
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border bg-background p-6 space-y-4"
      >
        <h2 className="text-2xl font-semibold">Not a Denomination</h2>

        <p className="leading-relaxed text-lg md:text-base text-slate-800 dark:text-slate-200">
          The church of Christ in Bayugon is not affiliated with any religious
          denomination or man-made religious system. The division found in modern
          denominations is not part of God’s design, and unity among believers is
          emphasized in the Scriptures{" "}
          <span className="italic text-slate-600 dark:text-slate-400">
            (1 Corinthians 1:10–13)
          </span>.
        </p>

        <p className="leading-relaxed text-lg md:text-base text-slate-800 dark:text-slate-200">
          We exist as a local congregation of Christians who belong to Christ and seek
          to follow the teachings of the New Testament alone. Our identity reflects
          the pattern of the first-century church, where believers assembled regularly
          to worship God, serve one another, and carry out the work of the Lord{" "}
          <span className="italic text-slate-600 dark:text-slate-400">
            (1 Corinthians 1:2; Acts 20:7; 1 Timothy 5:16; 1 Corinthians 16:1–2)
          </span>.
        </p>
      </motion.div>


      {items.length > 1 ? (



        <ul className="space-y-4">
          {items.map((item: string, i: number) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex gap-3 rounded-xl border bg-background p-6"
            >
              {/* <Circle className="mt-2 h-2 w-2 shrink-0 fill-current stroke-none text-slate-900 dark:text-slate-100" /> */}
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-900 dark:bg-slate-100" />
              <p className="leading-relaxed text-lg md:text-base text-slate-800 dark:text-slate-200">
                {item}
              </p>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="whitespace-pre-line">{data.identity}</p>
      )}
    </section>
  );
}
