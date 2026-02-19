"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CurveWave from "@/components/ui/CurveWave";
import WeeklyScheduleCard from "@/components/WeeklyScheduleCard";
import HeroBackground from "@/components/home/HeroBackground";
import OurBeliefPreview from "@/components/home/OurBeliefPreview";
import CurveWaveResponsive from "@/components/ui/CurveWaveResponsive";
import RotatingVerse from "@/components/RotatingVerse";

import {
  ChevronsRight,
  BookOpen,
  HandHeart,
  Megaphone,
  History,
  MapPin,
  ArrowRight,
} from "lucide-react";

type Sermon = {
  id: string;
  title: string;
  date: string;
  imageUrl?: string;
};

type Event = {
  id: string;
  title: string;
  eventDate: string;
  location?: string;
  imageUrl?: string;
};

type BibleStudy = {
  id: string;
  title: string;
  studyDate: string;
  imageUrl?: string;
};


type Props = {
  sermons: Sermon[];
  events: Event[];
  bibleStudies: BibleStudy[];
};

// type Props = {
//   sermons: any[];
//   events: any[];
//   bibleStudies: any[];
// };

/* -----------------------
   Cathedral-grade motion
------------------------ */
// const fadeUp = {
//   hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
//   show: { opacity: 1, y: 0, filter: "blur(0px)" },
// };

// const fadeUp = {
//   hidden: { opacity: 0, y: 24 },
//   show: { opacity: 1, y: 0 },
// };

const fadeUp = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1 },
};


function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* -----------------------
   Smooth wave fade helper
   (adds a gradient veil so waves blend softly)
------------------------ */
function WaveFade({
  fromClass,
  toClass,
  position = "top",
}: {
  fromClass: string;
  toClass: string;
  position?: "top" | "bottom";
}) {
  return (
    <div
      className={[
        "pointer-events-none absolute left-0 w-full",
        position === "top" ? "top-0 h-20" : "bottom-0 h-28",
        `bg-gradient-to-b ${fromClass} ${toClass}`,
      ].join(" ")}
    />
  );
}

/* -----------------------
   Premium card style
   (reverent: subtle lift, no bouncy scale)
------------------------ */


const premiumCard =
  "rounded-3xl bg-white/60 dark:bg-slate-950/60 " +
  "backdrop-blur-xl backdrop-saturate-150 " +
  "border border-white/30 dark:border-slate-700/50 " +
  "shadow-[0_12px_32px_-18px_rgba(0,0,0,0.28)] " +
  "dark:shadow-[0_12px_28px_-18px_rgba(0,0,0,0.7)] " +
  "transition-all duration-300 ease-out " +
  "hover:shadow-[0_20px_48px_-15px_rgba(0,0,0,0.38)] " +
  "hover:-translate-y-0.75";


export default function HomeClient({ sermons, events, bibleStudies }: Props) {

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* ================= HERO (Cinematic Parallax + Cathedral typography) ================= */}
      {/* <section className="relative min-h-[110vh] sm:min-h-[90vh] -mt-16 overflow-hidden text-slate-50"> */}
      
     <section className="
          relative
          min-h-[92vh]
          sm:min-h-[90vh]
          lg:min-h-screen
          overflow-hidden
          text-slate-50
        "
      >
        {/* Parallax layer */}
        <div className="absolute inset-0">
        <HeroBackground />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-black/50 to-slate-950/40" />

          <div className="
              relative z-10
              flex
              items-start
              md:items-center
              max-h-[650px]:items-start
              justify-center
              min-h-[86vh]
              pt-28
              md:pt-20
              lg:pt-0
              max-h-[650px]:pt-32
              pb-32 md:pb-0
            "
          >
          <div className="w-full">
              <div
                className="
                  max-w-4xl mx-auto px-6 text-center
                  space-y-6
                  max-h-[650px]:space-y-4
                "
              >
              <Reveal>
              <p
                className="
                  uppercase tracking-[0.35em]
                  text-xs sm:text-base
                  text-slate-300
                  max-h-[650px]:text-[0.6rem]
                  max-h-[650px]:tracking-[0.25em]
                "
              >
                  Bayugon Church of Christ
                </p>
              </Reveal>
              
              <Reveal delay={0.05}>
                <div className="
                  flex items-center justify-center gap-4
                  max-h-[650px]:gap-2
                ">

                  <span className="h-px w-20 bg-slate-400/60" />
                  <span className="h-px w-20 bg-slate-400/60" />
                </div>
              </Reveal>

              {/* Refined typography hierarchy */}
              <Reveal delay={0.08}>
                <h1
                  className="
                    text-[clamp(2rem,4vw,3.5rem)]
                    md:text-[clamp(2.3rem,4.5vw,3.75rem)]
                    max-h-[650px]:md:text-[2.4rem]

                    font-semibold
                    leading-[1.05]
                    tracking-tight
                    text-balance
                  "
                  >
                    <span className="block">Examine the foundation of the faith</span>
                  <span className="block ">established by Christ Himself.</span>
                </h1>
              </Reveal>

            <Reveal delay={0.12}>
              <p
                className="
                  max-w-2xl mx-auto
                  text-slate-200/95
                  text-lg sm:text-xl
                  leading-relaxed

                  [@media(max-height:650px)]:text-base
                  [@media(max-height:650px)]:leading-snug
                "
              >
                We invite sincere seekers to examine the teachings of the New Testament
                and the foundation established by Christ.
              </p>
            </Reveal>

              <Reveal delay={0.16}>
                <RotatingVerse />
              </Reveal>

              <Reveal delay={0.2}>
              <div
                  className="
                    pt-2 md:pt-6 pb-24 md:pb-0
                    flex flex-wrap justify-center gap-4
                    max-h-[650px]:pt-3
                    max-h-[650px]:gap-3
                  "
                >
                  <Link
                    href="/about/who-we-are"
                    aria-label="Who we are"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-blue-700 text-white text-sm font-semibold hover:bg-blue-600 transition-all duration-300 shadow-md"
                  >
                    Investigate Us <ChevronsRight className="w-5 h-5 text-white shrink-0" />
                  </Link>

                  <Link
                    href="/directory"
                    aria-label="Find a congregation directory"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-blue-400/70 text-white text-sm font-semibold hover:bg-blue-400/10 transition-all duration-300"
                  >
                    <MapPin className="w-5 h-5 text-blue-400 shrink-0" /> Find a Congregation
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Wave + smooth fade */}
        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          {/* <WaveFade fromClass="from-transparent" toClass="to-white dark:to-slate-950" position="bottom" /> */}
          <CurveWave />
        </div>
      </section>

      {/* ================= TOP CARDS ================= */}
      <section className="max-w-7xl mx-auto px-6 -mt-24 sm:-mt-24 md:-mt-28 relative z-30">
        <div className="grid md:grid-cols-3 gap-8">
          <Reveal>
            <Link href="/about/who-we-are/our-belief" className="block">
              <Card className={`${premiumCard} p-10 sm:p-10 text-center space-y-4`}>
                <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/60 p-3">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>

                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight">What We Believe</CardTitle>
                </CardHeader>

                <CardContent className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  Our beliefs come from God’s Word, serving as our standard for faith and daily living.
                </CardContent>

                <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold text-lg hover:text-blue-900 dark:hover:text-blue-200 transition-colors">
                  Explore Our Beliefs <ChevronsRight className="w-5 h-5 mt-1" />
                </span>
              </Card>
            </Link>
          </Reveal>

          <Reveal delay={0.06}>
            <Link href="/about/how-we-worship" className="block">
              <Card className={`${premiumCard} p-10 sm:p-10 text-center space-y-4`}>
                <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/60 p-3">
                  <HandHeart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>

                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight">How We Worship</CardTitle>
                </CardHeader>

                <CardContent className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  Rooted in Scripture, we stand for truth, simplicity, and genuine faith in God’s Word.
                </CardContent>

                <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold text-lg hover:text-blue-900 dark:hover:text-blue-200 transition-colors">
                  See How We Worship <ChevronsRight className="w-5 h-5 mt-1" />
                </span>
              </Card>
            </Link>
          </Reveal>

          <Reveal delay={0.12}>
            <Link href="/about/history" className="block">
              <Card className={`${premiumCard} p-10 sm:p-10 text-center space-y-4`}>
                <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/60 p-3">
                  <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>

                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tracking-tight">Our History</CardTitle>
                </CardHeader>

                <CardContent className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  Learn how the Church of Christ in Bayugon began and remained faithful to the New Testament.
                </CardContent>

                <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold text-lg hover:text-blue-900 dark:hover:text-blue-200 transition-colors">
                  Read Our History <ChevronsRight className="w-5 h-5 mt-1" />
                </span>
              </Card>
            </Link>
          </Reveal>
        </div>
      </section>

      <main>

        {/* ================= WORSHIP (White → Blue-50) ================= */}
        <section id="worship" className="relative pt-36 pb-32 bg-white dark:bg-slate-950 overflow-visible">
          <div className="absolute bottom-0 left-0 w-full pointer-events-none">
            <WaveFade fromClass="from-transparent" toClass="to-blue-50 dark:to-slate-900" position="bottom" />
            <CurveWaveResponsive direction="normal" baseClass="fill-blue-50 dark:fill-slate-900" />
          </div>

          <div className="max-w-7xl mx-auto px-6 space-y-24">
            <div className="grid md:grid-cols-2 gap-16 lg:gap-20 items-center">
              <Reveal>
                <div className="relative rounded-3xl overflow-hidden shadow-lg">
                  <Image
                    src="/main-header1.jpg"
                    alt="Seek first the kingdom of God"
                    width={1200}
                    height={800}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="h-72 md:h-80 w-full object-cover"                  
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/60" />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                    <blockquote className="italic text-lg leading-relaxed max-w-md">
                      “Seek ye first the kingdom of God, and his righteousness;
                      and all these things shall be added unto you.”
                    </blockquote>
                    <span className="mt-3 text-sm font-medium text-white/90">
                      — Matthew 6:33 (KJV)
                    </span>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="space-y-6 md:pl-6">
                  <p className="text-sm uppercase tracking-widest text-blue-800 dark:text-blue-300 font-semibold">
                    Join Us for Worship
                  </p>

                  <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight text-slate-900 dark:text-slate-50 text-balance">
                     <span className="block">Worship God in</span>
                     <span className="block mt-2 md:mt-3">Spirit and in Truth</span>
                  </h2>

                  <p className="text-lg text-slate-700 dark:text-slate-500 leading-relaxed">
                    We gather weekly to praise God, study His Word, and strengthen one
                    another in faith and love.
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link
                      href="/schedules"
                      className="inline-flex items-center gap-2 rounded-full bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-all duration-300 px-6 py-3 shadow-md"
                    >
                      Service Timeline <ChevronsRight className="w-5 h-5" />
                    </Link>

                    <Link
                      href="/about/how-we-worship"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-blue-700 text-blue-700 font-semibold hover:bg-blue-700/10 transition-all duration-300"
                    >
                     <HandHeart className="w-5 h-5" /> How We Worship
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.12} className="max-w-4xl mx-auto">
              <WeeklyScheduleCard />
            </Reveal>
          </div>
        </section>

        {/* ================= OUR BELIEF PREVIEW (Blue-50) ================= */}
        <section className="relative bg-blue-50 dark:bg-slate-900 py-20">
          <Reveal>
            <OurBeliefPreview />
          </Reveal>
        </section>

        {/* ================= OUTREACH (Blue-50 → White via wave) ================= */}
        <section className="relative bg-blue-50 dark:bg-slate-900 py-20">
          <div className="absolute bottom-0 left-0 w-full pointer-events-none">
            <WaveFade fromClass="from-transparent" toClass="to-white dark:to-slate-950" position="bottom" />
            <CurveWaveResponsive direction="reverse" baseClass="fill-white dark:fill-slate-950" />
          </div>

          <div className="max-w-7xl mx-auto px-6 space-y-16">
            <Reveal>
              <div className="space-y-4 text-center">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Our Work & Outreach</h2>
                <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  We actively share God’s Word through teaching, service, and community engagement.
                </p>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-8">
              <Reveal>
                <Link href="/about/preaching-activities" className="block">
                  <Card className={`${premiumCard} p-10 text-center space-y-4`}>
                    <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/60 p-3">
                      <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-2xl font-semibold tracking-tight">Preaching Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      Reaching others through teaching, outreach, and community engagement.
                    </CardContent>
                    <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold text-lg hover:text-blue-900 dark:hover:text-blue-200 transition-colors">
                      See our work <ChevronsRight className="w-5 h-5 mt-1" />
                    </span>
                  </Card>
                </Link>
              </Reveal>

              <Reveal delay={0.06}>
                <Link href="/bible-studies" className="block">
                  <Card className={`${premiumCard} p-10 text-center space-y-4`}>
                    <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/60 p-3">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-2xl font-semibold tracking-tight">Bible Studies</CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      Studying God’s Word verse by verse to grow in understanding and faith.
                    </CardContent>
                    <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold text-lg hover:text-blue-900 dark:hover:text-blue-200 transition-colors">
                      Explore studies <ChevronsRight className="w-5 h-5 mt-1" />
                    </span>
                  </Card>
                </Link>
              </Reveal>

              <Reveal delay={0.12}>
                <Link href="/sermons" className="block">
                  <Card className={`${premiumCard} p-10 text-center space-y-4`}>
                    <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/60 p-3">
                      <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-2xl font-semibold tracking-tight">Sermons</CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      Bible-based preaching that encourages obedience and faithful living.
                    </CardContent>
                    <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold text-lg hover:text-blue-900 dark:hover:text-blue-200 transition-colors">
                      Listen & read <ChevronsRight className="w-5 h-5 mt-1" />
                    </span>
                  </Card>
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================= WHY VISIT (White) ================= */}
        <section className="bg-white dark:bg-slate-950 py-28">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal>
              <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl shadow-[0_18px_45px_-30px_rgba(2,6,23,0.35)] dark:shadow-none p-10 sm:p-12 text-center space-y-6">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Why Visit Us?</h2>
                <p className="max-w-3xl mx-auto text-slate-600 dark:text-slate-400 leading-relaxed">
                  Whether you are seeking truth, exploring Christianity, or returning to
                  faith, you are welcome here. We are a community striving to follow Christ
                  and live according to His teachings.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-4">
                  <Link href="/contact" className="px-7 py-3 rounded-full bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-all duration-300 shadow-md">
                    Plan a Visit
                  </Link>
                  <Link href="/about" className="px-7 py-3 rounded-full border border-blue-700 text-blue-700 font-semibold hover:bg-blue-700/10 transition-all duration-300">
                    Learn More
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= FEATURED MEDIA (White + wave to Blue-50) ================= */}
        <section   id="featured-media" className="relative overflow-hidden py-32 bg-white dark:bg-slate-950">
          <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-20">
            <Reveal>
              <div className="text-center space-y-4">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Featured Media</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Recent Bible studies and sermons centered on God’s Word.
                </p>
              </div>
            </Reveal>

            {/* Bible Studies */}
            <div className="space-y-8">
              <Reveal>
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold tracking-tight">Latest Bible Studies</h3>
                  <Link href="/bible-studies" className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold hover:underline">
                    View all <ArrowRight className="w-4 h-4 mt-1" />
                  </Link>
                </div>
              </Reveal>

              <div className="grid md:grid-cols-3 gap-8">
                {bibleStudies?.slice(0, 3).map((study: BibleStudy, idx: number) => (
                  <Reveal key={study.id} delay={0.04 * idx}>
                    <Link
                      href={`/bible-studies/${study.id}`}
                      className="group block rounded-3xl overflow-hidden bg-white/72 dark:bg-slate-950/68 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_18px_45px_-30px_rgba(2,6,23,0.45)] dark:shadow-none hover:-translate-y-1 transition-all duration-300 ease-out"
                    >
                      {study.imageUrl && (
                        <div className="overflow-hidden">
                          <Image
                            src={study.imageUrl}
                            alt={study.title}
                            width={900}
                            height={650}
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="w-full h-52 object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="p-6 space-y-3">
                        <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition">
                          {study.title}
                        </h4>

                        <p className="text-sm text-slate-500">
                          {new Date(study.studyDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>

                        <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 text-sm font-medium">
                          View Study <ChevronsRight className="w-4 h-4 mt-1" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Sermons */}
            <div className="space-y-8">
              <Reveal>
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold tracking-tight">Latest Sermons</h3>
                  <Link href="/sermons" className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold hover:underline">
                    View all <ArrowRight className="w-4 h-4 mt-1" />
                  </Link>
                </div>
              </Reveal>

              <div className="grid md:grid-cols-3 gap-8">
                {sermons?.slice(0, 3).map((s: Sermon, idx: number) => (
                  <Reveal key={s.id} delay={0.04 * idx}>
                    <Link
                      href={`/sermons/${s.id}`}
                      className="group block rounded-3xl overflow-hidden bg-white/72 dark:bg-slate-950/68 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_18px_45px_-30px_rgba(2,6,23,0.45)] dark:shadow-none hover:-translate-y-1 transition-all duration-300 ease-out"
                    >
                      {s.imageUrl && (
                        <div className="overflow-hidden">
                          <Image
                            src={s.imageUrl}
                            alt={s.title}
                            width={900}
                            height={650}
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="w-full h-52 object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="p-6 space-y-3">
                        <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition">
                          {s.title}
                        </h4>

                        <p className="text-sm text-slate-500">
                          {new Date(s.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>

                        <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 text-sm font-medium">
                          View Sermon <ChevronsRight className="w-4 h-4 mt-1" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 z-10 left-0 w-full pointer-events-none">
            <WaveFade fromClass="from-transparent" toClass="to-blue-50 dark:to-slate-900" position="bottom" />
            <CurveWaveResponsive direction="normal" baseClass="fill-blue-50 dark:fill-slate-900" />
          </div>
        </section>

        {/* ================= EVENTS (Blue-50) ================= */}
        <section id="events" className="bg-blue-50 dark:bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">

            {/* Header */}
            <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                    Upcoming Events
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Join us in gatherings and special activities.
                </p>
                </div>

                <Link
                href="/events"
                aria-label="View all church events"
                className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-semibold hover:underline"
                >
                View all <ArrowRight className="w-4 h-4 mt-1" />
                </Link>
            </div>
            </Reveal>

            {/* Grid Wrapper (IMPORTANT FIX) */}
            <div className="grid md:grid-cols-3 gap-8">

            {!events?.length ? (
                <div className="md:col-span-3">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl p-10 text-center shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">
                    No Upcoming Events
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                    Please check back soon for upcoming gatherings and special activities.
                    </p>
                </div>
                </div>
            ) : (
                events.slice(0, 3).map((e: Event, idx: number) => (
                <Reveal key={e.id} delay={0.04 * idx}>
                    <Link
                    href={`/events/${e.id}`}
                    className="group block rounded-3xl overflow-hidden bg-white/72 dark:bg-slate-950/68 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/60 shadow-[0_18px_45px_-30px_rgba(2,6,23,0.45)] dark:shadow-none hover:-translate-y-1 transition-all duration-300 ease-out"
                    >
                    {e.imageUrl && (
                        <div className="overflow-hidden">
                        <Image
                            src={e.imageUrl}
                            alt={e.title}
                            width={900}
                            height={650}
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="w-full h-52 object-cover transition duration-500 group-hover:scale-105"
                        />
                        </div>
                    )}

                    <div className="p-6 space-y-3">
                        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition">
                        {e.title}
                        </h3>

                        <div className="text-sm text-slate-500 space-y-1">
                        {e.eventDate && (
                            <p>
                            {new Date(e.eventDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                            </p>
                        )}
                        {e.location && (
                            <p className="line-clamp-1">{e.location}</p>
                        )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-medium text-sm">
                        View Event <ChevronsRight className="w-4 h-4 mt-1" />
                        </span>
                    </div>
                    </Link>
                </Reveal>
                ))
            )}

            </div>
        </div>
        </section>

        {/* ================= DIRECTORY CTA (White) ================= */}
        <section className="bg-blue-50 dark:bg-slate-900 py-28">
          <div className="max-w-5xl mx-auto px-6">
            <Reveal>
              <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl shadow-[0_18px_45px_-30px_rgba(2,6,23,0.35)] dark:shadow-none p-10 sm:p-12 text-center space-y-6">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                  Looking for a Church Near You?
                </h2>

                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Browse congregations across Palawan and connect with local brethren.
                </p>

                <Link
                  href="/directory"
                  aria-label="View churches directory page"
                  className="inline-flex items-center gap-2 
                            px-6 py-3 md:px-8 md:py-4 
                            text-sm md:text-base
                            rounded-full bg-blue-700 text-white font-semibold 
                            hover:bg-blue-800 transition-all duration-300 shadow-md 
                            whitespace-nowrap"
                >
                  View Churches Directory
                  <ArrowRight className="w-5 h-5" />
                </Link>

              </div>
            </Reveal>
          </div>
        </section>

      </main>
    </div>
  );
}
