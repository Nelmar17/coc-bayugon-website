"use client";

import { motion } from "framer-motion";
import CurveWave from "@/components/ui/CurveWave";

const fadeUp = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function LegalLayout({
  title,
  subtitle,
  backgroundImage = "/church-contact.jpg",
  children,
}: {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* ================= HERO ================= */}
      <section className="relative h-[38vh] md:h-[45vh] min-h-[380px] overflow-hidden">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-sm"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-black/70 to-slate-950/60" />

        {/* Glow Accent */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="
            absolute
            top-1/2 left-1/2
            -translate-x-1/2 -translate-y-1/2
            w-[600px] h-[600px]
            bg-blue-500/10
            blur-3xl
            rounded-full
          " />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center h-full text-center px-6">
          <div className="max-w-3xl space-y-6">

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl font-heading tracking-tight text-white"
            >
              {title}
            </motion.h1>

            {subtitle && (
              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-slate-200 max-w-2xl mx-auto leading-relaxed"
              >
                {subtitle}
              </motion.p>
            )}

          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <CurveWave />
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="
              rounded-3xl
              bg-white/80 dark:bg-slate-950/80
              backdrop-blur-xl
              border border-slate-200 dark:border-slate-800
              shadow-[0_20px_50px_-30px_rgba(0,0,0,0.45)]
              p-10 md:p-14
              space-y-10
            "
          >
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
