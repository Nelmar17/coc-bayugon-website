"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CurveWave from "@/components/ui/CurveWave";
import { ChevronsRight, BookOpen, ShieldCheck, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1], // cubic-bezier (easeOut)
    },
  },
};

export default function AboutPage() {

  return (
      <div className="space-y-14 bg-white dark:bg-slate-950 ">
              {/* HEADER */}
          <section className=" relative h-[28vh] sm:h-[45vh] md:h-[40vh] min-h-[380px] sm:min-h-[320px] overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
              style={{
                 backgroundImage: "url('/church-contact.jpg')",
               }}
            />
         <div className="absolute inset-0 bg-black/60" />
           <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-2 sm:pt-16">
              <div className="max-w-xl sm:max-w-2xl mx-auto">
                  <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                        Overview
                      </h1>
                      <p className="pt-4 sm:pt-4 text-slate-200 text-base sm:text-lg leading-relaxed">
                        Learn more about who we are, our leadership, and our preaching
                        activities as the Church of Christ in Bayugon.
                      </p>
                    </motion.div>
                </div>
              </div>
            <div className="absolute bottom-0 left-0 w-full pointer-events-none">
            <CurveWave />
        </div>
      </section>

          <div className="max-w-7xl mx-auto px-4 pb-28 space-y-10">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-5xl text-lg mx-auto text-center text-slate-800 dark:text-slate-200"
            >
              The Church of Christ in Bayugon is a local congregation seeking to follow
              Christ and His Word alone. We are not part of any denomination, but strive
              to live, worship, and serve according to the teachings of the New Testament.
            </motion.p>

            <motion.blockquote
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-center text-lg italic text-slate-800 dark:text-slate-200"
              >
                “Speak where the Bible speaks, and be silent where the Bible is silent.”
                <span className="block mt-1 text-md not-italic">
                   — Colossians 3:17 (KJV)
                </span>
            </motion.blockquote>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center text-slate-800 dark:text-slate-200 text-sm"
            >
              New here? We recommend starting with{" "}
              <span className="font-semibold">Our Identity</span>.
            </motion.p>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="grid md:grid-cols-3 gap-6"
              >

                <AboutCard
                  title="Our Identity"
                  href="/about/who-we-are"
                  icon={BookOpen}
                  description="Who we are as a church, what we believe, and how we seek to follow Christ according to the New Testament."
                />

                <AboutCard
                  title="How We Are Led"
                  href="/about/leadership"
                  icon={ShieldCheck}
                  description="Learn about the biblical pattern of leadership and the servants who help guide the congregation."
                />

                <AboutCard
                  title="Our Work & Ministry"
                  href="/about/preaching-activities"
                  icon={Megaphone}
                  description="Explore our preaching efforts, gospel meetings, and outreach activities in Bayugon and beyond."
                />
            </motion.div>
        </div>
      </div>
  );
}

function AboutCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Link href={href}>
        <Card className="group rounded-2xl h-full transition hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
              <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>

          <CardContent className="text-md text-slate-800 dark:text-slate-200 space-y-3">
            <p>{description}</p>

            <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-600 group-active:underline">
              Learn more <ChevronsRight className="w-4 h-4 mt-0.5" />
            </span>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}



