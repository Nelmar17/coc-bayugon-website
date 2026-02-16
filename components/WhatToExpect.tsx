"use client";

import { motion } from "framer-motion";
import { Handshake, HandHelping, MailCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

type WhatToExpectProps = {
  compact?: boolean;
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function ExpectCard({
  icon: Icon,
  title,
  text,
  compact,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  compact?: boolean;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card
        className={`
          rounded-2xl border bg-white dark:bg-slate-950 text-center
          ${compact ? "p-5" : "p-6"}
          space-y-4
        `}
      >
        {/* <div className="mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 w-fit">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>

        <h3 className="font-semibold text-lg md:text-xl">
          {title}
        </h3>

        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
          {text}
        </p> */}

            <div className="mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 w-fit">
                <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>

            <h3 className="font-semibold text-lg md:text-xl">
            {title}
            </h3>

            <p className="text-slate-700 dark:text-slate-200 text-base md:text-lg leading-relaxed">
            {text}
            </p>
      </Card>
    </motion.div>
  );
}

export default function WhatToExpect({ compact = false }: WhatToExpectProps) {
  return (
    <section
      className={`
        bg-slate-100 dark:bg-slate-950/60
        ${compact ? "py-20 pb-28" : "py-20 pb-28"}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        <header className={`text-center space-y-3 ${compact ? "mb-6" : ""}`}>
          <h2 className={`font-bold ${compact ? "text-2xl" : "text-3xl"}`}>
            What to Expect When You Visit
          </h2>

          {!compact && (
            <p className="text-md text-slate-700 dark:text-slate-200">
              If you are visiting for the first time, here’s what you can expect.
            </p>
          )}
        </header>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className={`grid md:grid-cols-3 ${compact ? "gap-4" : "gap-6"}`}
        >
          <ExpectCard
            icon={Handshake}
            title="A Warm Welcome"
            text="You will be greeted warmly, but never pressured. Visitors are welcome to observe and participate as they feel comfortable."
            compact={compact}
          />

          <ExpectCard
            icon={HandHelping}
            title="Simple & Orderly Worship"
            text="Our services are reverent, focused, and centered on Scripture rather than entertainment."
            compact={compact}
          />

          <ExpectCard
            icon={MailCheck}
            title="Open Invitation"
            text="No special attire is required. Please come as you are, with an open heart and a sincere desire to learn."
            compact={compact}
          />
        </motion.div>
      </div>
    </section>
  );
}
