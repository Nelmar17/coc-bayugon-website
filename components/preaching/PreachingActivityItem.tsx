"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

function typeLabel(type: string) {
  const map: Record<string, string> = {
    gospel_meeting: "Gospel Meeting",
    midweek_service: "Midweek Service",
    sunday_service: "Sunday Service",
    visitation: "Visitation",
    mission_trip: "Mission Trip",
    youth_service: "Youth Service",
    special_event: "Special Event",
  };
  return map[type] ?? type;
}

export default function PreachingActivityItem({ a }: { a: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Timeline dot */}
        <span
        className="
            absolute
            left-1/2 sm:-left-[40px]
            -translate-x-1/2 sm:translate-x-0
            top-2 sm:top-10
            -translate-y-4 sm:translate-y-0
            w-4 h-4
            rounded-full
            bg-blue-500
            ring-4 ring-blue-200/60 dark:ring-blue-900/70
            z-20
        " 
        />
        <Link
            href={`/about/preaching-activities/${a.id}-${a.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}`}
            className="group block rounded-2xl p-6 sm:p-7
                    border border-blue-400/20
                    bg-gradient-to-br
                    from-white/80 via-white/70 to-blue-50/60
                    dark:from-slate-950/70 dark:via-slate-900/70 dark:to-blue-950/40
                    backdrop-blur-xl
                    shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300" 
        >
        {/* META */}
        <div className="flex flex-wrap gap-2 text-md text-slate-800 dark:text-slate-200 pt-2 mb-3">
          {a.startDate && (
            <span>
              {format(new Date(a.startDate), "MMM d, yyyy • h:mm a")}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full border">
            {typeLabel(a.type)}
          </span>
          {a.preacher && (
            <span className="px-2 py-0.5 rounded-full border">
              {a.preacher}
            </span>
          )}
          {a.location && (
            <span className="px-2 py-0.5 rounded-full border">
              {a.location}
            </span>
          )}
        </div>
        
        <h3 className="text-lg sm:text-xl font-semibold mb-6
                       text-slate-900 dark:text-white
                       group-hover:text-blue-600 transition">
          {a.title}
        </h3>

        {/* IMAGE */}
        {a.coverImageUrl && (
          <motion.div
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl overflow-hidden mb-4 h-[240px] sm:h-[330px]"
          >
            <Image
              src={a.coverImageUrl}
              alt={a.title}
              width={1200}
              height={600}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {a.description && (
          <p className="text-md text-slate-800 dark:text-slate-200 leading-relaxed">
            {a.description}
          </p>
        )}
      </Link>
    </motion.div>
  );
}
