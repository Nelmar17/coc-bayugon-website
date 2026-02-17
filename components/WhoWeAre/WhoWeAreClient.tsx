"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ChevronsRight } from "lucide-react";
import CurveWave from "@/components/ui/CurveWave";


/* ================= ANIMATIONS ================= */

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

/* ================= PAGE ================= */

type WhoWeAreData = {
  intro: string;
  mission: string;
  belief: string;
  identity: string;
  community: string;
};

export default function WhoWeAreClient({ data }: { data: WhoWeAreData }) {
  return (
    <motion.div
      className="space-y-6 bg-white dark:bg-slate-950"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* ================= HEADER ================= */}
      <section className="relative h-[40vh] min-h-[360px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
          style={{ backgroundImage: "url('/church-contact.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Investigate Us
            </h1>
              <p className="pt-2 sm:pt-4 text-slate-200 text-base sm:text-lg leading-relaxed">
                <span className="block italic">
                “But with me it is a very small thing that I should be judged of you,
                </span>
                <span className="block italic">
                      of man's judgment: yea, I judge not mine own self.” 
                </span>
                <span className="block not-italic mt-1 font-semibold">
                1 Corinthians 4:3 (KJV)
              </span>
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <CurveWave />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        {/* ================= WHO WE ARE ================= */}
          <motion.section variants={sectionVariants} className="space-y-6">
            <h2 className="text-4xl font-bold">Who We Are</h2>

            <blockquote className="mt-2 border-l-4 border-blue-600 pl-4 italic text-slate-700 dark:text-slate-300 max-w-2xl">
              “And I say also unto thee, That thou art Peter, and upon this rock
              I will build my church; and the gates of hell shall not prevail against it.”
              <span className="block not-italic mt-2 font-medium text-slate-500">
                — Matthew 16:18 (KJV)
              </span>
            </blockquote>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              {data.intro}
            </p>
          </motion.section>


        {/* ================= WHY WE EXIST ================= */}
        <motion.section
          variants={sectionVariants}
          className="max-w-3xl mx-auto text-center space-y-6"
        >
          <h2 className="text-3xl font-bold">Why We Exist</h2>

          <p className="text-lg text-slate-600 dark:text-slate-400">
            We exist to glorify God by following the pattern of the New Testament
            church, teaching the Word faithfully, and encouraging one another in love and good works.
          </p>

          <p className="italic text-slate-500 dark:text-slate-300">
            “Be ye followers of me, even as I also am of Christ.”
            <span className="block not-italic mt-1 font-medium">
              — 1 Corinthians 11:1 (KJV)
            </span>
          </p>

          {/* <p className="italic text-slate-500/80 dark:text-slate-400 text-sm">
            “And whatsoever ye do in word or deed, do all in the name of the Lord Jesus…”
            <span className="block not-italic mt-1 font-medium">
              — Colossians 3:17 (KJV)
            </span>
          </p> */}
        </motion.section>

        {/* ================= INFO CARDS ================= */}
        <motion.div
          variants={containerVariants}
          className="grid md:grid-cols-2 gap-8"
        >
          <InfoBlock title="Our Mission" text={data.mission} href="/about/who-we-are/our-mission" />
          <InfoBlock title="Our Belief" text={data.belief} href="/about/who-we-are/our-belief" />
          <InfoBlock title="Our Identity" text={data.identity} href="/about/who-we-are/our-identity" />
          <InfoBlock title="Our Community" text={data.community} href="/about/who-we-are/our-community" />
        </motion.div>

        {/* ================= OUR LEADERSHIP ================= */}
        <motion.section
            variants={sectionVariants}
            className="max-w-4xl mx-auto text-center space-y-6"
            >
            <h2 className="text-3xl font-bold">Our Leadership</h2>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                The church is guided by faithful men devoted to shepherding the flock
                according to Scripture.
            </p>

            <p className="italic text-slate-500 dark:text-slate-300">
                “Take heed therefore unto yourselves, and to all the flock, over the which
                the Holy Ghost hath made you overseers, to feed the church of God, which he
                hath purchased with his own blood.”
                <span className="block not-italic mt-1 font-medium">
                — Acts 20:28 (KJV)
                </span>
            </p>

            {/* future: elders / leaders cards */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                {/* LeaderCard components later */}
            </div>
        </motion.section>

        {/* ================= WHAT WE ARE NOT ================= */}
        <motion.section
          variants={sectionVariants}
          className="bg-slate-100 shadow-sm dark:bg-slate-900/40 rounded-2xl p-8 space-y-4"
        >
          <h2 className="text-2xl font-bold">What We Are Not</h2>

          <ul className="list-disc pl-6 text-lg text-slate-800 dark:text-slate-200 space-y-2">
            <li>We are not a denomination</li>
            <li>We are not founded by men</li>
            <li>We do not follow creeds or councils</li>
            <li>We strive to follow the Bible alone</li>
          </ul>

          <p className="italic text-slate-700 dark:text-slate-300">
            “Now I beseech you, brethren… that there be no divisions among you.”
            <span className="block not-italic mt-1 font-medium">
              — 1 Corinthians 1:10 (KJV)
            </span>
          </p>

          <p className="italic text-slate-600 dark:text-slate-300">
            “Teaching for doctrines the commandments of men.”
            <span className="block not-italic mt-1 font-medium">
              — Matthew 15:9 (KJV)
            </span>
          </p>
        </motion.section>

        {/* ================= CTA ================= */}
        <motion.section
          variants={sectionVariants}
          className="text-center py-16 space-y-6"
        >
          <h2 className="text-2xl font-bold">Want to Learn More?</h2>

          <p className="text-slate-600 dark:text-slate-400">
            We invite you to study the Scriptures with us and learn more about God's design
            for His church.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/contact" className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700">
              Contact Us
            </Link>

            <Link href="/bible-studies" className="px-6 py-3 rounded-full border border-blue-600 text-blue-600 dark:text-blue-100  font-semibold hover:bg-blue-600/10">
              Study With Us
            </Link>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

/* ================= CARD ================= */

function InfoBlock({
  title,
  text,
  href,
}: {
  title: string;
  text: string;
  href: string;
}) {
  return (
    <motion.div variants={sectionVariants}>
      <Link href={href} className="group block">
        <div className="rounded-xl border bg-background p-6 space-y-3
                        shadow-lg hover:shadow-xl hover:border-blue-700
                        transition-all duration-300">
          <h3 className="text-xl font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-400">
            {title}
          </h3>

          <p className="text-lg text-slate-600 dark:text-slate-400 line-clamp-4">
            {text}
          </p>

          <span className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600">
            Read more <ChevronsRight className="w-5 h-5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
