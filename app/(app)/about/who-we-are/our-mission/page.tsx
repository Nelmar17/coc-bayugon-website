"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {ChevronRight, Info} from "lucide-react";

async function getData() {
  const res = await fetch("/api/who-we-are", { cache: "no-store" });
  return res.json();
}

export default function OurMissionPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getData().then(setData);
  }, []);

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "instant" });
}, []);

  if (!data) return null;

  const items = data.mission
    .split("•")
    .map((i: string) => i.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
     <section className="max-w-6xl pt-[100px] pb-24 mx-auto px-4 space-y-16">

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
                  Our Mission
                </span>
               </nav>

      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold">Our Mission</h1>
        <p className="italic text-slate-700 dark:text-slate-400">
          To Do The Lord’s Work (Eph. 4:12; 1 Cor. 15:58)
        </p>
      </motion.header>

      {items.length > 1 ? (
        <ul className="space-y-6">
          {items.map((item: string, i: number) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex gap-3 rounded-xl shadow-md border bg-background p-6 border-blue-400/20 bg-white dark:bg-slate-950/60"
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
        <p className="whitespace-pre-line">{data.mission}</p>
      )}
    </section>
  </div>
  );
}
