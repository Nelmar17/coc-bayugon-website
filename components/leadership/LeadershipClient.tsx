"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

export default function LeadershipClient({ leaders }: { leaders: any[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-2 pb-28 space-y-12">
      {/* TEXT */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-7xl rounded-2xl bg-background p-6 space-y-4 shadow-md border border-blue-400/20 bg-white dark:bg-slate-950/60"
      >
        <h2 className="text-2xl font-semibold">Biblical Leadership</h2>

        <p className="text-lg text-slate-800 dark:text-slate-300 leading-relaxed">
          The church of Christ does not recognize a separate clergy class. Leadership
             within the congregation follows the New Testament pattern, where qualified
             men serve as elders (also called bishops or pastors) and deacons, while all
             members serve as fellow servants of Christ{" "}         
          <span className="italic text-slate-950 dark:text-slate-100">
            {" "} (Matthew 23:8–12; Philippians 1:1)
          </span>.
        </p>

        <p className="text-lg text-slate-800 dark:text-slate-300 leading-relaxed">
          Each congregation is self-governing under the authority of Christ, with
          leaders appointed to shepherd, teach, and care for the spiritual well-being
          of the members{" "}
          <span className="italic text-slate-950 dark:text-slate-100">
            {" "} (Acts 14:23; 1 Timothy 3:1–13; 1 Peter 5:1–4)
          </span>.
        </p>
      </motion.section>

      {/* CARDS */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 py-6"
      >
        {leaders.map((l) => (
          <motion.div
            key={l.id}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="rounded-2xl bg-background p-6 text-center space-y-4 shadow-md hover:shadow-lg border border-blue-400/20 bg-white dark:bg-slate-950/60 transition"
          >
            {l.imageUrl && (
              <div className="mx-auto w-24 h-24 rounded-full ring-1 ring-blue-400 overflow-hidden border">
                <Image
                  src={l.imageUrl}
                  alt={l.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg">{l.name}</h3>
              <p className="text-lg text-slate-500">{l.role}</p>
            </div>

            {l.bio && (
              <p className="text-md text-slate-600 dark:text-slate-400">
                {l.bio}
              </p>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
