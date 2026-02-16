// app/(app)/page.tsx
import HomeClient from "@/components/home/HomeClient";

async function getLatest(path: string, limit: number = 3) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/${path}`, {  cache: "no-store",});
  if (!res.ok) return [];
  const data = await res.json();
  return data.slice(0, limit);
}


export default async function HomePage() {
  const [sermons, events, bibleStudies] = await Promise.all([
    getLatest("sermons"),
    getLatest("events"),
    getLatest("bible-studies"),
  ]);

  return <HomeClient sermons={sermons} events={events} bibleStudies={bibleStudies} />;
}



// // app/(app)/page.tsx
// import Link from "next/link";
// import Image from "next/image";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import CurveWave from "@/components/ui/CurveWave";
// import WeeklyScheduleCard from "@/components/WeeklyScheduleCard";
// import HeroBackground from "@/components/HeroBackground";
// import OurBeliefPreview from "@/components/home/OurBeliefPreview";
// import CurveWaveResponsive from "@/components/ui/CurveWaveResponsive";
// import RotatingVerse from "@/components/RotatingVerse";

// import {
//   ChevronsRight,
//   BookOpen,
//   HandHeart,
//   Megaphone,
//   History,
//   MapPin,
//   ArrowRight,
// } from "lucide-react";

// async function getLatest(path: string, limit: number = 3) {
//   const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
//   const res = await fetch(`${base}/api/${path}`, { cache: "no-store" });
//   if (!res.ok) return [];
//   const data = await res.json();
//   return data.slice(0, limit);
// }

// export default async function HomePage() {
//   const [sermons, events, bibleStudies] = await Promise.all([
//     getLatest("sermons"),
//     getLatest("events"),
//     getLatest("bible-studies"),
//   ]);

//   return (
//     <div className="min-h-screen bg-white dark:bg-slate-950">

//       {/* ================= HERO ================= */}
//       <section className="relative h-[124vh] sm:h-[90vh]  min-h-[320px] -mt-16 overflow-hidden text-slate-50">
//         <HeroBackground />
//         <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-black/60 to-slate-950/40" />
//         <div className="relative z-10 flex items-center -mt-20 h-full">
//           <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
//             <p className="uppercase tracking-[0.35em] text-sm text-slate-300">
//               Bayugon Church of Christ
//             </p>

//             <div className="flex justify-center gap-4">
//               <span className="h-px w-20 bg-slate-400/60" />
//               <span className="h-px w-20 bg-slate-400/60" />
//             </div>

//             <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
//               Examine the foundation of the faith
//               <span className="block mt-3">
//                 established by Christ Himself.
//               </span>
//             </h1>

//             <p className="max-w-2xl mx-auto text-slate-200 text-lg">
//               We invite sincere seekers to examine the teachings of the New Testament
//               and the foundation established by Christ.
//             </p>

//             <RotatingVerse />

//             <div className="pt-6 flex flex-wrap justify-center gap-4">
//               <Link
//                 href="/about/who-we-are"
//                 className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-700 text-white text-sm font-semibold hover:bg-blue-600 transition-all duration-300"
//               >
//                 Investigate Us <ChevronsRight className="w-5 h-5" />
//               </Link>

//               <Link
//                 href="/directory"
//                 className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-blue-400 text-white text-sm font-semibold hover:bg-blue-400/10 transition-all duration-300"
//               >
//                 <MapPin className="w-5 h-5 text-blue-400" />
//                 Find a Congregation
//               </Link>
//             </div>
//           </div>
//         </div>
//         <div className="absolute bottom-0 w-full">
//           <CurveWave />
//         </div>
//       </section>

//       {/* ================= BELIEF CARDS ================= */}
//       <section className="max-w-7xl mx-auto px-6 -mt-28 relative z-30">
//         <div className="grid md:grid-cols-3 gap-8">
//           {[
//             {
//               href: "/about/who-we-are/our-belief",
//               icon: <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
//               title: "What We Believe",
//               desc: "Our beliefs come from God’s Word, serving as our standard for faith and daily living.",
//               link: "Explore Our Beliefs",
//             },
//             {
//               href: "/about/how-we-worship",
//               icon: <HandHeart className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
//               title: "How We Worship",
//               desc: "Rooted in Scripture, we stand for truth, simplicity, and genuine faith in God’s Word.",
//               link: "See How We Worship",
//             },
//             {
//               href: "/about/history",
//               icon: <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
//               title: "Our History",
//               desc: "Learn how the Church of Christ in Bayugon began and remained faithful to the New Testament.",
//               link: "Read Our History",
//             },
//           ].map((item, i) => (
//             <Link key={i} href={item.href}>
//               <Card className="rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out p-10 text-center space-y-4">
//                 <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/60 p-3">
//                   {item.icon}
//                 </div>
//                 <CardHeader>
//                   <CardTitle className="text-2xl">{item.title}</CardTitle>
//                 </CardHeader>
//                 <CardContent className="text-lg text-slate-700 dark:text-slate-300">
//                   {item.desc}
//                 </CardContent>
//                 <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
//                   {item.link} <ChevronsRight className="w-5 h-5" />
//                 </span>
//               </Card>
//             </Link>
//           ))}
//         </div>
//       </section>

//       {/* ================= WORSHIP SECTION ================= */}
//       <section className="relative pt-32 pb-28 bg-white dark:bg-slate-950">
//         <div className="absolute bottom-0 w-full">
//           <CurveWaveResponsive baseClass="fill-blue-50 dark:fill-slate-900" />
//         </div>

//         <div className="max-w-7xl mx-auto px-6 space-y-24">
//           <div className="grid md:grid-cols-2 gap-16 items-center">
//             <div className="relative rounded-3xl overflow-hidden shadow-lg">
//               <Image
//                 src="/main-header1.jpg"
//                 alt="Seek first the kingdom of God"
//                 width={800}
//                 height={500}
//                 className="h-72 md:h-80 w-full object-cover"
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/60" />
//               <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
//                 <blockquote className="italic text-lg leading-relaxed max-w-md">
//                   “Seek ye first the kingdom of God, and his righteousness;
//                   and all these things shall be added unto you.”
//                 </blockquote>
//                 <span className="mt-3 text-sm font-medium text-white/90">
//                   — Matthew 6:33 (KJV)
//                 </span>
//               </div>
//             </div>

//             <div className="space-y-6">
//               <p className="text-sm uppercase tracking-widest text-blue-700 font-semibold">
//                 Join Us for Worship
//               </p>
//               <h2 className="text-4xl font-bold">
//                 Worship God in Spirit and in Truth
//               </h2>
//               <p className="text-lg text-slate-600 dark:text-slate-400">
//                 We gather weekly to praise God, study His Word, and strengthen one another in faith and love.
//               </p>
//               <div className="flex flex-wrap gap-4">
//                 <Link href="/schedules" className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white font-semibold px-6 py-3 hover:bg-blue-700 transition-all duration-300 shadow-md">
//                   Service Timeline <ChevronsRight className="w-5 h-5" />
//                 </Link>
//                 <Link href="/about/how-we-worship" className="px-6 py-3 rounded-full border border-blue-600 text-blue-600 font-semibold hover:bg-blue-600/10 transition-all duration-300">
//                   How We Worship
//                 </Link>
//               </div>
//             </div>
//           </div>

//           <div className="max-w-4xl mx-auto">
//             <WeeklyScheduleCard />
//           </div>
//         </div>
//       </section>

//             {/* ================= OUR BELIEF PREVIEW ================= */}
//       <section className="relative bg-blue-50 dark:bg-slate-900 py-20">
//         <OurBeliefPreview />
//       </section>

//       {/* ================= OUR WORK & OUTREACH ================= */}
//       <section className="relative bg-blue-50 dark:bg-slate-900 py-20">
//         <div className="absolute bottom-0 left-0 w-full">
//           <CurveWaveResponsive
//             direction="reverse"
//             baseClass="fill-white dark:fill-slate-950"
//           />
//         </div>

//         <div className="max-w-7xl mx-auto px-6 space-y-16">
//           <div className="text-center space-y-4">
//             <h2 className="text-3xl font-bold">Our Work & Outreach</h2>
//             <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
//               We actively share God’s Word through teaching, service, and community engagement.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {[
//               {
//                 href: "/about/preaching-activities",
//                 icon: <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
//                 title: "Preaching Activities",
//                 desc: "Reaching others through teaching, outreach, and community engagement.",
//                 link: "See our work",
//               },
//               {
//                 href: "/bible-studies",
//                 icon: <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
//                 title: "Bible Studies",
//                 desc: "Studying God’s Word verse by verse to grow in understanding and faith.",
//                 link: "Explore studies",
//               },
//               {
//                 href: "/sermons",
//                 icon: <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
//                 title: "Sermons",
//                 desc: "Bible-based preaching that encourages obedience and faithful living.",
//                 link: "Listen & read",
//               },
//             ].map((item, i) => (
//               <Link key={i} href={item.href}>
//                 <Card className="rounded-3xl bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out p-10 text-center space-y-4">
//                   <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/60 p-3">
//                     {item.icon}
//                   </div>
//                   <CardHeader>
//                     <CardTitle className="text-2xl">{item.title}</CardTitle>
//                   </CardHeader>
//                   <CardContent className="text-lg text-slate-700 dark:text-slate-300">
//                     {item.desc}
//                   </CardContent>
//                   <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
//                     {item.link} <ChevronsRight className="w-5 h-5" />
//                   </span>
//                 </Card>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ================= WHY VISIT US ================= */}
//       <section className="bg-white dark:bg-slate-950 py-28">
//         <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
//           <h2 className="text-3xl font-bold">Why Visit Us?</h2>

//           <p className="text-slate-600 dark:text-slate-400">
//             Whether you are seeking truth, exploring Christianity, or returning to
//             faith, you are welcome here. We are a community striving to follow Christ
//             and live according to His teachings.
//           </p>

//           <div className="flex justify-center gap-4 pt-4">
//             <Link
//               href="/contact"
//               className="px-6 py-3 rounded-full bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-all duration-300"
//             >
//               Plan a Visit
//             </Link>
//             <Link
//               href="/about"
//               className="px-6 py-3 rounded-full border border-blue-600 text-blue-700 font-semibold hover:bg-blue-600/10 transition-all duration-300"
//             >
//               Learn More
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* ================= FEATURED MEDIA ================= */}
//       <section className="relative overflow-hidden py-32 bg-white dark:bg-slate-950">
//         <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-20">
//           <div className="text-center space-y-4">
//             <h2 className="text-3xl font-bold">Featured Media</h2>
//             <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
//               Recent Bible studies and sermons centered on God’s Word.
//             </p>
//           </div>

//           {/* Bible Studies */}
//           <div className="space-y-8">
//             <div className="flex justify-between items-center">
//               <h3 className="text-2xl font-semibold">Latest Bible Studies</h3>
//               <Link
//                 href="/bible-studies"
//                 className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
//               >
//                 View all <ArrowRight className="w-4 h-4" />
//               </Link>
//             </div>

//             <div className="grid md:grid-cols-3 gap-8">
//               {bibleStudies.slice(0, 3).map((study: any) => (
//                 <Link
//                   key={study.id}
//                   href={`/bible-studies/${study.id}`}
//                   className="group rounded-3xl overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
//                 >
//                   {study.imageUrl && (
//                     <div className="overflow-hidden">
//                       <Image
//                         src={study.imageUrl}
//                         alt={study.title}
//                         width={600}
//                         height={400}
//                         className="w-full h-52 object-cover transition duration-500 group-hover:scale-105"
//                       />
//                     </div>
//                   )}

//                   <div className="p-6 space-y-3">
//                     <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition">
//                       {study.title}
//                     </h4>

//                     <p className="text-sm text-slate-500">
//                       {new Date(study.studyDate).toLocaleDateString("en-US", {
//                         year: "numeric",
//                         month: "long",
//                         day: "numeric",
//                       })}
//                     </p>

//                     <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
//                       View Study <ChevronsRight className="w-4 h-4" />
//                     </span>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           </div>

//           {/* Sermons */}
//           <div className="space-y-8">
//             <div className="flex justify-between items-center">
//               <h3 className="text-2xl font-semibold">Latest Sermons</h3>
//               <Link
//                 href="/sermons"
//                 className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
//               >
//                 View all <ArrowRight className="w-4 h-4" />
//               </Link>
//             </div>

//             <div className="grid md:grid-cols-3 gap-8">
//               {sermons.slice(0, 3).map((s: any) => (
//                 <Link
//                   key={s.id}
//                   href={`/sermons/${s.id}`}
//                   className="group rounded-3xl overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
//                 >
//                   {s.imageUrl && (
//                     <div className="overflow-hidden">
//                       <Image
//                         src={s.imageUrl}
//                         alt={s.title}
//                         width={600}
//                         height={400}
//                         className="w-full h-52 object-cover transition duration-500 group-hover:scale-105"
//                       />
//                     </div>
//                   )}

//                   <div className="p-6 space-y-3">
//                     <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition">
//                       {s.title}
//                     </h4>

//                     <p className="text-sm text-slate-500">
//                       {new Date(s.date).toLocaleDateString("en-US", {
//                         year: "numeric",
//                         month: "long",
//                         day: "numeric",
//                       })}
//                     </p>

//                     <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium">
//                       View Sermon <ChevronsRight className="w-4 h-4" />
//                     </span>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="absolute bottom-0 w-full">
//           <CurveWaveResponsive baseClass="fill-blue-50 dark:fill-slate-900" />
//         </div>
//       </section>

      
//       {/* ================= UPCOMING EVENTS ================= */}
//       <section className="bg-blue-50 dark:bg-slate-900 py-20">
//         <div className="max-w-7xl mx-auto px-6 space-y-12">

//           <div className="flex items-end justify-between">
//             <div className="space-y-2">
//               <h2 className="text-3xl font-bold">
//                 Upcoming Events
//               </h2>
//               <p className="text-slate-600 dark:text-slate-400">
//                 Join us in gatherings and special activities.
//               </p>
//             </div>

//             <Link
//               href="/events"
//               className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
//             >
//               View all <ArrowRight className="w-4 h-4" />
//             </Link>
//           </div>

//           {events.length === 0 ? (
//             <p className="text-sm text-slate-500">No events yet.</p>
//           ) : (
//             <div className="grid md:grid-cols-3 gap-8">
//               {events.slice(0, 3).map((e: any) => (
//                 <Link
//                   key={e.id}
//                   href={`/events/${e.id}`}
//                   className="group rounded-3xl overflow-hidden
//                     bg-white/70 dark:bg-slate-950/70
//                     backdrop-blur-xl
//                     shadow-lg hover:shadow-xl
//                     hover:-translate-y-1
//                     transition-all duration-300 ease-out"
//                 >
//                   {e.imageUrl && (
//                     <div className="overflow-hidden">
//                       <Image
//                         src={e.imageUrl}
//                         alt={e.title}
//                         width={600}
//                         height={400}
//                         className="w-full h-52 object-cover transition duration-500 group-hover:scale-105"
//                       />
//                     </div>
//                   )}

//                   <div className="p-6 space-y-3">
//                     <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition">
//                       {e.title}
//                     </h3>

//                     <div className="text-sm text-slate-500 space-y-1">
//                       {e.eventDate && (
//                         <p>
//                           {new Date(e.eventDate).toLocaleDateString("en-US", {
//                             year: "numeric",
//                             month: "long",
//                             day: "numeric",
//                           })}
//                         </p>
//                       )}

//                       {e.location && (
//                         <p className="line-clamp-1">{e.location}</p>
//                       )}
//                     </div>

//                     <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium text-sm">
//                       View Event <ChevronsRight className="w-4 h-4" />
//                     </span>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* ================= DIRECTORY CTA ================= */}
//       <section className="bg-white dark:bg-slate-950 py-28">
//         <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
//           <h2 className="text-3xl font-bold">
//             Looking for a Church Near You?
//           </h2>

//           <p className="text-slate-600 dark:text-slate-400">
//             Browse congregations across Palawan and connect with local brethren.
//           </p>

//           <Link
//             href="/directory"
//             className="inline-flex items-center gap-2 px-8 py-4 rounded-full
//               bg-blue-700 text-white font-semibold
//               hover:bg-blue-800
//               transition-all duration-300 shadow-md"
//           >
//             View Churches Directory <ArrowRight className="w-5 h-5" />
//           </Link>
//         </div>
//       </section>

//     </div>
//   );
// }







// // app/(app)/page.tsx
// import Link from "next/link";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import CurveWave from "@/components/ui/CurveWave";
// import WeeklyScheduleCard from "@/components/WeeklyScheduleCard";
// import HeroBackground from "@/components/HeroBackground";
// import OurBeliefPreview from "@/components/home/OurBeliefPreview";
// import CurveWaveResponsive from "@/components/ui/CurveWaveResponsive";
// import RotatingVerse from "@/components/RotatingVerse";

// import {
//   ChevronsRight, 
//   BookOpen,
//   HandHeart,
//   Users,
//   Megaphone,
//   CalendarDays,
//   History,
//   MapPin,
//   ArrowRight,
  
// } from "lucide-react";


// async function getLatest(path: string, limit: number = 3) {
//   const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
//   const res = await fetch(`${base}/api/${path}`, { cache: "no-store" });
//   if (!res.ok) return [];
//   const data = await res.json();
//   return data.slice(0, limit);
// }

// export default async function HomePage() {
//  const [sermons, events, bibleStudies] = await Promise.all([
//   getLatest("sermons"),
//   getLatest("events"),
//   getLatest("bible-studies"),
// ]);


//   return (
//     <div className="min-h-screen bg-white dark:bg-slate-950">

//     <section className="relative h-[90vh] min-h-[320px] -mt-16 overflow-hidden text-slate-50">
//       {/* BACKGROUND */}
//       <HeroBackground />
//       <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-black/50 to-slate-950/40 pointer-events-none" />
//       {/* CONTENT */}
//       <div className="relative z-10 h-full -mt-10 flex items-center">
//         <div className="w-full">
//           <div className="max-w-4xl mx-auto px-6 text-center space-y-6">

//             {/* CHURCH NAME */}
//             <p className="uppercase tracking-[0.3em] text-md text-slate-300">
//               Bayugon Church of Christ
//             </p>

//             {/* DIVIDER */}
//             <div className="flex items-center justify-center gap-4">
//               <span className="h-px w-20 bg-slate-400/60" />
//               <span className="h-px w-20 bg-slate-400/60" />
//             </div>

//             {/* MAIN HEADLINE */}
//             <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug">
//               <span className="block">
//                 Examine the foundation of the faith
//               </span>
//               <span className="block mt-2 sm:mt-3">
//                 established by Christ Himself.
//               </span>
//             </h1>
      
//             {/* SUPPORTING TEXT */}
//             <p className="max-w-2xl mx-auto text-slate-200 text-lg">
//               We invite sincere seekers to examine the teachings of the New Testament
//               and the foundation established by Christ.
//             </p>

//             {/* BIBLE VERSE */}
//             <RotatingVerse />

//             {/* CTA */}
//             <div className="pt-4 flex flex-wrap justify-center gap-4">
//               <Link
//                 href="/about/who-we-are"
//                 className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-blue-700 text-white text-sm font-medium hover:bg-blue-600 transition"
//               >
//                 Investigate Us <ChevronsRight className="w-5 h-5 text-white shrink-0" />
//               </Link>

//               <Link
//                 href="/directory"
//                 className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full border border-blue-400/70 text-white text-sm font-medium hover:bg-blue-400/10 transition"
//               >
//                 <MapPin className="w-5 h-5 text-blue-400 shrink-0" /> Find a Congregation
//               </Link>
//             </div>

//           </div>
//         </div>
//       </div>
//     {/* WAVE */}
//     <div className="absolute bottom-0 left-0 w-full pointer-events-none">
//       <CurveWave />
//     </div>
//   </section>

//       <section className="max-w-7xl mx-auto px-6 -mt-32 sm:-mt-24 relative z-30">        
//           <div className="grid md:grid-cols-3 gap-8"> 
//             <Link href="/about/who-we-are/our-belief" className="block">
//               <Card className="rounded-3xl border-0 p-10 sm:p-10 text-center space-y-2 bg-white/60
//                   dark:bg-slate-900/60 backdrop-blur dark:shadow-none hover:scale-[1.02] transition-transform">
             
//                   <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/80 p-3">
//                     <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//                   </div>

//                   <CardHeader>
//                     <CardTitle className="text-2xl">What We Believe</CardTitle>
//                   </CardHeader>
                  
//                   <CardContent className="text-lg text-slate-800 dark:text-slate-200">
//                     Our beliefs come from God’s Word, serving as our standard for faith and daily living.
//                   </CardContent>
//                   <span
//                     className="
//                       inline-flex items-center gap-1
//                       text-blue-600 dark:text-blue-400
//                       font-semibold text-lg
//                       hover:text-blue-800 dark:hover:text-blue-600 
//                     "
//                   >
//                     Explore Our Beliefs <ChevronsRight className="w-5 h-5 mt-1" />
//                   </span>
//                 </Card>
//               </Link>

//             <Link href="/about/how-we-worship" className="block">
//               <Card
//                 className="
//                   rounded-3xl border-0 p-10 sm:p-10
//                   text-center space-y-2
//                   bg-white/60 dark:bg-slate-900/60
//                   dark:shadow-none backdrop-blur
//                   transition
//                   hover:scale-[1.02] 
//                   cursor-pointer
//                 "
//               >
//                 <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/80 p-3">
//                   <HandHeart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//                 </div>

//                 <CardHeader>
//                   <CardTitle className="text-2xl">How We Worship</CardTitle>
//                 </CardHeader>

//                 <CardContent className="text-lg text-slate-800 dark:text-slate-200">
//                   Rooted in Scripture, we stand for truth, simplicity, and genuine faith in God’s Word.
//                 </CardContent>

//                 {/* VISUAL LINK ONLY */}
//                 <span
//                   className="
//                     inline-flex items-center gap-1
//                     text-blue-600 dark:text-blue-400
//                     font-semibold text-lg
//                     hover:text-blue-800 dark:hover:text-blue-600
//                   "
//                 >
//                   See How We Worship <ChevronsRight className="w-5 h-5 mt-1" />
//                 </span>
//               </Card>
//             </Link>

//             <Link href="/about/history" className="block">
//               <Card
//                 className="
//                   rounded-3xl border-0 p-10 sm:p-10
//                   text-center space-y-2
//                   bg-white/60 dark:bg-slate-900/60
//                   dark:shadow-none backdrop-blur
//                   transition
//                   hover:scale-[1.02] 
//                   cursor-pointer
//                 "
//               >
//                 <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/80 p-3">
//                   <History className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//                 </div>

//                 <CardHeader>
//                   <CardTitle className="text-2xl">Our History</CardTitle>
//                 </CardHeader>

//                 <CardContent className="text-lg text-slate-800 dark:text-slate-200">
//                   Learn how the Church of Christ in Bayugon began and remained faithful to the New Testament.
//                 </CardContent>

//                 {/* VISUAL LINK ONLY */}
//                 <span
//                   className="
//                     inline-flex items-center gap-1
//                     text-blue-600 dark:text-blue-400
//                     font-semibold text-lg
//                     hover:text-blue-800 dark:hover:text-blue-600
//                   "
//                 >
//                   Read Our History <ChevronsRight className="w-5 h-5 mt-1" />
//                 </span>
//               </Card>
//             </Link>   
//           </div>
//        </section>
   
//  <main>
//   {/* Join Us for Worship */}
//   <section className="relative pt-40 pb-36 bg-white dark:bg-slate-950 overflow-visible">
//     <div className="absolute bottom-0 left-0 w-full pointer-events-none">
//       <CurveWaveResponsive direction="normal" baseClass="fill-cyan-100 dark:fill-slate-900"/>
//     </div>
//       <div className="max-w-7xl mx-auto px-6 space-y-24 ">

//         {/* TOP GRID */}
//         <div className="grid md:grid-cols-2 gap-16 lg:gap-20 items-center">

//           {/* LEFT IMAGE */}
//           <div className="relative rounded-3xl overflow-hidden shadow-lg">
//             <img
//               src="/main-header1.jpg"
//               alt="Seek first the kingdom of God"
//               className="h-72 md:h-80 w-full object-cover"
//             />

//             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/60" />

//             <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
//               <blockquote className="italic text-lg leading-relaxed max-w-md">
//                 “Seek ye first the kingdom of God, and his righteousness;
//                 and all these things shall be added unto you.”
//               </blockquote>

//               <span className="mt-3 text-sm font-medium text-white/90">
//                 — Matthew 6:33 (KJV)
//               </span>
//             </div>
//           </div>

//           {/* RIGHT CONTENT */}
//           <div className="space-y-6 md:pl-6">
//             <p className="text-sm uppercase tracking-widest text-blue-700 font-semibold">
//               Join Us for Worship
//             </p>

//             <h2 className="text-4xl font-bold leading-tight">
//               Worship God in Spirit and in Truth
//             </h2>

//             <p className="text-lg text-slate-600 dark:text-slate-400">
//               We gather weekly to praise God, study His Word, and strengthen one
//               another in faith and love.
//             </p>

//               {/* TWO BUTTON ROW */}
//             <div className="flex flex-wrap gap-4 pt-2">

//               <Link
//                 href="/schedules"
//                   className="
//                   inline-flex items-center gap-1.5
//                   whitespace-nowrap
//                   rounded-full
//                   bg-blue-600 text-white font-semibold
//                   hover:bg-blue-700 transition
//                    px-4 py-2 text-md
//                   sm:px-6 sm:py-3 sm:text-base
//                   shadow-xl
//                 "
//             >
//                 Service Timeline <ChevronsRight className="w-5 h-5 " />
//               </Link>

//               <Link
//                 href="/about/how-we-worship"
//                 className="px-6 py-3 rounded-full border border-blue-600 text-blue-600 font-semibold hover:bg-blue-600/10 transition"
//               >
//                 How We Worship
//               </Link>
//             </div>
//           </div>
//         </div>
//         {/* SCHEDULE — FULL WIDTH BELOW */}
//         <div className="max-w-4xl mx-auto">
//           <WeeklyScheduleCard />
//         </div>
//       </div>

// </section>

//   {/* OUR BELIEF VERTICAL TAP COMPONENTS */}
//     <section className="relative bg-cyan-100 dark:bg-slate-900 py-16">
//       <OurBeliefPreview />
//     </section>

//   {/* Our Work & Outreach */}
//   <section className="relative bg-cyan-100 dark:bg-slate-900 py-16">
//      {/* WAVE TO WHITE */}
//     <div className="absolute bottom-0 left-0 w-full pointer-events-none">
//       <CurveWaveResponsive direction="reverse" baseClass="fill-white dark:fill-slate-950"/>
//        </div>

//         <div className="max-w-7xl mx-auto px-6 space-y-16">
//           {/* HEADER */}
//           <div className="space-y-4 text-center">
//             <h2 className="text-3xl font-bold">
//               Our Work & Outreach
//             </h2>
//             <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
//               We actively share God’s Word through teaching, service, and community engagement.
//             </p>
//           </div>

//           {/* CARDS */}
//           <div className="grid md:grid-cols-3 gap-8">
//             <Link href="/about/preaching-activities" className="block">
//               <Card className="
//                 rounded-3xl border-0 p-10
//                 text-center space-y-2
//                 bg-white/60 dark:bg-slate-950/60
//                 dark:shadow-none backdrop-blur
//                 transition hover:scale-[1.02] 
//               ">
//                 <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/80 p-3">
//                   <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//                 </div>

//                 <CardHeader>
//                   <CardTitle className="text-2xl">Preaching Activities</CardTitle>
//                 </CardHeader>

//                 <CardContent className="text-lg text-slate-800 dark:text-slate-200">
//                   Reaching others through teaching, outreach, and community engagement.
//                 </CardContent>

//                 <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-lg 
//                                 hover:text-blue-800 dark:hover:text-blue-600">
//                   See our work <ChevronsRight className="w-5 h-5 mt-1" />
//                 </span>
//               </Card>
//             </Link>

//             {/* Bible Studies */}
//             <Link href="/bible-studies" className="block">             
//               <Card className="
//                 rounded-3xl border-0 p-10
//                  text-center space-y-2
//                bg-white/60 dark:bg-slate-950/60
//                  dark:shadow-none backdrop-blur
//                  transition hover:scale-[1.02] 
//               ">
//                 <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/80 p-3">
//                   <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//                 </div>

//                 <CardHeader>
//                   <CardTitle className="text-2xl">Bible Studies</CardTitle>
//                 </CardHeader>

//                 <CardContent className="text-lg text-slate-800 dark:text-slate-200">
//                   Studying God’s Word verse by verse to grow in understanding and faith.
//                 </CardContent>

//                 <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-lg
//                                hover:text-blue-800 dark:hover:text-blue-600">
//                   Explore studies <ChevronsRight className="w-5 h-5 mt-1" />
//                 </span>
//               </Card>
//             </Link>

//               {/* Sermons */}
//               <Link href="/sermons" className="block">
//                 <Card className="
//                   rounded-3xl border-0 p-10
//                   text-center space-y-2
//                   bg-white/60 dark:bg-slate-950/60
//                   dark:shadow-none backdrop-blur
//                   transition hover:scale-[1.02] 
//                 ">
//                   <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/80 p-3">
//                     <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//                   </div>

//                   <CardHeader>
//                     <CardTitle className="text-2xl">Sermons</CardTitle>
//                   </CardHeader>

//                   <CardContent className="text-lg text-slate-800 dark:text-slate-200">
//                     Bible-based preaching that encourages obedience and faithful living.
//                   </CardContent>

//                   <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-lg
//                                    hover:text-blue-800 dark:hover:text-blue-600">
//                     Listen & read <ChevronsRight className="w-5 h-5 mt-1" />
//                   </span>
//                 </Card>
//               </Link>
//             </div>
//           </div>
          
//         </section>

//      {/* Why Visit Us? */}
//       <section className="bg-white dark:bg-slate-950 py-28">
//         <div className="max-w-7xl mx-auto px-6 space-y-6">
//             <h2 className="text-2xl font-bold mb-4">
//               Why Visit Us?
//             </h2>
//             <p className="max-w-3xl text-slate-600 dark:text-slate-400">
//               Whether you are seeking truth, exploring Christianity, or returning to
//               faith, you are welcome here. We are a community striving to follow Christ
//               and live according to His teachings.
//             </p>
//             <div className="mt-6 flex gap-4">
//               <Link
//                 href="/contact"
//                 className="px-4 py-2 rounded-full bg-blue-700 text-white text-sm"
//               >
//                 Plan a Visit
//               </Link>
//               <Link
//                 href="/about"
//                 className="px-4 py-2 rounded-full border border-blue-600 text-blue-700 text-sm"
//               >
//                 Learn More
//               </Link>
//             </div>
//           </div>
//         </section>

//     {/* Featured Media */}
//     <section className="relative overflow-hidden py-32 bg-white dark:bg-slate-950">
//         <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-20">
//           {/* HEADER */}
//           <div className="text-center space-y-4">
//             <h2 className="text-3xl font-bold">
//               Featured Media
//             </h2>
//             <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
//               Recent Bible studies and sermons centered on God’s Word.
//             </p>
//           </div>

//           {/* BIBLE STUDIES */}
//           <div className="space-y-8">
//             <div className="flex justify-between items-center">
//               <h3 className="text-2xl font-semibold">Latest Bible Studies</h3>
//               <Link href="/bible-studies" className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline">
//                 View all <ArrowRight className="w-4 h-4 mt-1" />
//               </Link>
//             </div>

//             <div className="grid md:grid-cols-3 gap-8">
//               {bibleStudies.slice(0,3).map((study:any) => (
//                 <Link
//                   key={study.id}
//                   href={`/bible-studies/${study.id}`}
//                   className="group rounded-3xl overflow-hidden
//                     bg-white/60 dark:bg-slate-900/60
//                     backdrop-blur-xl
//                     shadow-xl hover:shadow-2xl  dark:shadow-none dark:hover:shadow-none
//                     transition hover:scale-[1.02]"
//                 >
//                   {study.imageUrl && (
//                     <div className="overflow-hidden">
//                       <img
//                         src={study.imageUrl}
//                         alt={study.title}
//                         className="w-full h-52 object-cover transition duration-500 group-hover:scale-105"
//                       />
//                     </div>
//                   )}

//                   <div className="p-6 space-y-3">
//                     <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition">
//                       {study.title}
//                     </h4>

//                     <p className="text-sm text-slate-500">
//                       {new Date(study.studyDate).toLocaleDateString("en-US", {
//                         year: "numeric",
//                         month: "long",
//                         day: "numeric",
//                       })}
//                     </p>

//                     <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-600">
//                       View Study <ChevronsRight className="w-4 h-4 mt-1" />
//                     </span>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           </div>

//           {/* SERMONS */}
//           <div className="space-y-8">
//             <div className="flex justify-between items-center">
//               <h3 className="text-2xl font-semibold">Latest Sermons</h3>
//               <Link href="/sermons" className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline">
//                 View all <ArrowRight className="w-4 h-4 mt-1" />
//               </Link>
//             </div>

//             <div className="grid md:grid-cols-3 gap-8">
//               {sermons.slice(0,3).map((s:any) => (
//                 <Link
//                   key={s.id}
//                   href={`/sermons/${s.id}`}
//                   className="group rounded-3xl overflow-hidden
//                     bg-white/60 dark:bg-slate-900/60
//                     backdrop-blur-xl 
//                     shadow-xl hover:shadow-2xl dark:shadow-none dark:hover:shadow-none
//                     transition hover:scale-[1.02]"
//                 >
//                   {s.imageUrl && (
//                     <div className="overflow-hidden">
//                       <img
//                         src={s.imageUrl}
//                         alt={s.title}
//                         className="w-full h-52 object-cover transition duration-500 group-hover:scale-105"
//                       />
//                     </div>
//                   )}

//                   <div className="p-6 space-y-3">
//                     <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition">
//                       {s.title}
//                     </h4>

//                     <p className="text-sm text-slate-500">
//                       {new Date(s.date).toLocaleDateString("en-US", {
//                         year: "numeric",
//                         month: "long",
//                         day: "numeric",
//                       })}
//                     </p>

//                     <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-600">
//                       View Sermon <ChevronsRight className="w-4 h-4 mt-1" />
//                     </span>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//       <div className="absolute bottom-0 z-10 left-0 w-full pointer-events-none">
//      <CurveWaveResponsive direction="normal" baseClass="fill-cyan-100 dark:fill-slate-900"/>
//   </div>
// </section>

//        {/* Upcoming Events */}
//         <section className="bg-cyan-100 dark:bg-slate-900 py-16">
//           <div className="max-w-7xl mx-auto px-6 space-y-12">

//             {/* HEADER */}
//             <div className="flex items-end justify-between">
//               <div className="space-y-2">
//                 <h2 className="text-3xl font-bold">
//                   Upcoming Events
//                 </h2>
//                 <p className="text-slate-600 dark:text-slate-400">
//                   Join us in gatherings and special activities.
//                 </p>
//               </div>

//               <Link
//                 href="/events"
//                 className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
//               >
//                 View all <ArrowRight className="w-4 h-4 mt-1" />
//               </Link>
//             </div>

//             {/* GRID */}
//             {events.length === 0 ? (
//               <p className="text-sm text-slate-500">No events yet.</p>
//             ) : (
//               <div className="grid md:grid-cols-3 gap-8">
//                 {events.slice(0, 3).map((e: any) => (
//                   <Link
//                     key={e.id}
//                     href={`/events/${e.id}`}
//                     className="group rounded-2xl overflow-hidden
//                       bg-white dark:bg-slate-950
//                       shadow-xl hover:shadow-2xl dark:shadow-none dark:hover:shadow-none
//                       transition border border-transparent
//                       hover:border-blue-400"
//                   >
//                     {/* IMAGE */}
//                     {e.imageUrl && (
//                       <div className="overflow-hidden">
//                         <img
//                           src={e.imageUrl}
//                           alt={e.title}
//                           className="w-full h-52 object-cover transition duration-500 group-hover:scale-105"
//                         />
//                       </div>
//                     )}

//                     {/* CONTENT */}
//                     <div className="p-6 space-y-3">

//                       <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition">
//                         {e.title}
//                       </h3>

//                       <div className="text-sm text-slate-500 space-y-1">
//                         {e.eventDate && (
//                           <p>
//                             {new Date(e.eventDate).toLocaleDateString("en-US", {
//                               year: "numeric",
//                               month: "long",
//                               day: "numeric",
//                             })}
//                           </p>
//                         )}

//                         {e.location && (
//                           <p className="line-clamp-1">{e.location}</p>
//                         )}
//                       </div>

//                       <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium text-sm hover:text-blue-800 dark:hover:text-blue-600">
//                         View Event <ChevronsRight className="w-4 h-4 mt-1" />
//                       </span>
//                     </div>
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>
//         </section>

//         <section className=" bg-cyan-100 dark:bg-slate-900 py-28">
//           <div className="max-w-7xl mx-auto px-6">
//             <div className="rounded-2xl text-center space-y-4">
//               <h2 className="text-2xl font-bold">
//                 Looking for a Church Near You?
//               </h2>

//               <p className="text-slate-600 dark:text-slate-300">
//                 Browse congregations across Palawan and connect with local brethren.
//               </p>

//               <Link
//                 href="/directory"
//                 className="inline-flex items-center gap-1 px-6 py-3 rounded-full bg-blue-700 text-white hover:bg-blue-800"
//               >
//                 View Churches Directory <ArrowRight className="w-5 h-5 mt-1" />
//               </Link>
//             </div>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }






//  <Link href="/about/who-we-are" className="block">
//                <Card className="rounded-3xl border-0 p-10 shadow-xl text-center space-y-2 bg-white/60
//                 dark:bg-slate-900/60 backdrop-blur sm:p-8 hover:scale-[1.02] transition-transform">
              
//                  <div className="mx-auto w-fit rounded-full bg-blue-100/80 dark:bg-blue-900/80 p-3">
//                   <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//                  </div>

//                 <CardHeader>
//                   <CardTitle className="text-2xl">Who We Are</CardTitle>
//                 </CardHeader>
              
//                 <CardContent className="text-lg text-slate-800 dark:text-slate-200">
//                   Committed to God’s truth through faith, obedience, and a sincere non-denominational life of service.
//                 </CardContent>
//                   <span
//                     className="
//                       inline-flex items-center gap-1
//                       text-blue-600 dark:text-blue-400
//                       font-semibold text-lg
//                       hover:underline
//                     "
//                   >
//                      Get to Know Us <ChevronsRight className="w-5 h-5 mt-1" />
//                   </span>
//               </Card>
//             </Link> 



// <section className="bg-white dark:bg-slate-950 py-24">
//         <div className="max-w-7xl mx-auto px-6 space-y-12">

//           <div className="text-center space-y-4">
//             <h2 className="text-3xl font-bold">
//               Latest Bible Studies
//             </h2>
//             <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
//               Recent Bible study sessions designed to deepen understanding of God’s Word.
//             </p>
//           </div>

//           {bibleStudies.length === 0 ? (
//             <p className="text-center text-slate-500">
//               No Bible studies available yet.
//             </p>
//           ) : (
//             <div className="grid md:grid-cols-3 gap-8">
//               {bibleStudies.slice(0, 3).map((study: any) => (
//                 <Link
//                   key={study.id}
//                   href={`/bible-studies/${study.id}`}
//                   className="group block rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-slate-900 hover:shadow-xl transition"
//                 >
//                   {study.imageUrl && (
//                     <img
//                       src={study.imageUrl}
//                       className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
//                       alt={study.title}
//                     />
//                   )}

//                   <div className="p-6 space-y-3">
//                     <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition">
//                       {study.title}
//                     </h3>

//                     {study.studyDate && (
//                       <p className="text-sm text-slate-500">
//                         {new Date(study.studyDate).toLocaleDateString()}
//                       </p>
//                     )}

//                     <span className="inline-flex items-center gap-1 text-blue-600 font-medium text-sm">
//                       View Study <ChevronsRight className="w-4 h-4" />
//                     </span>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}

//           <div className="text-center">
//             <Link
//               href="/bible-studies"
//               className="text-blue-600 font-semibold hover:underline"
//             >
//               View all Bible Studies →
//             </Link>
//           </div>

//         </div>
//       </section>

        {/* Latest Sermons */}
        // <section className="bg-white dark:bg-slate-950 py-24">
        //   <div className="max-w-7xl mx-auto px-6 space-y-12">

        //     {/* HEADER */}
        //     <div className="flex items-end justify-between">
        //       <div className="space-y-2">
        //         <h2 className="text-3xl font-bold">
        //           Latest Sermons
        //         </h2>
        //         <p className="text-slate-600 dark:text-slate-400">
        //           Recent messages preached from God’s Word.
        //         </p>
        //       </div>

        //       <Link
        //         href="/sermons"
        //         className="text-blue-600 font-semibold hover:underline"
        //       >
        //         View all →
        //       </Link>
        //     </div>

        //     {/* GRID */}
        //     {sermons.length === 0 ? (
        //       <p className="text-sm text-slate-500">No sermons yet.</p>
        //     ) : (
        //       <div className="grid md:grid-cols-3 gap-8">
        //         {sermons.slice(0, 3).map((s: any) => (
        //           <Link
        //             key={s.id}
        //             href={`/sermons/${s.id}`}
        //             className="group rounded-2xl overflow-hidden
        //               bg-white dark:bg-slate-900
        //               shadow-xl hover:shadow-2xl
        //               transition border border-transparent
        //               hover:border-blue-400"
        //           >
        //             {/* IMAGE */}
        //             {s.imageUrl && (
        //               <div className="overflow-hidden">
        //                 <img
        //                   src={s.imageUrl}
        //                   alt={s.title}
        //                   className="w-full h-52 object-cover transition duration-500 group-hover:scale-105"
        //                 />
        //               </div>
        //             )}

        //             {/* CONTENT */}
        //             <div className="p-6 space-y-3">

        //               <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition">
        //                 {s.title}
        //               </h3>

        //               <div className="text-sm text-slate-500 space-y-1">
        //                 {s.preacher && <p>{s.preacher}</p>}
        //                 {s.date && (
        //                   <p>{new Date(s.date).toLocaleDateString()}</p>
        //                 )}
        //               </div>

        //               <span className="inline-flex items-center gap-1 text-blue-600 font-medium text-sm">
        //                 View Sermon
        //               </span>
        //             </div>
        //           </Link>
        //         ))}
        //       </div>
        //     )}

        //   </div>
        // </section> 








//{/* Join Us for Worship */}
// <section className="relative pt-28 pb-32 bg-white dark:bg-slate-950 overflow-visible">

//   <div className="relative z-20 max-w-7xl mx-auto px-6 space-y-16">

//     {/* HEADER */}
//     <div className="max-w-3xl mx-auto text-center space-y-6">

//       <h2 className="text-3xl font-bold">
//         Join Us for Worship
//       </h2>
//       <p className="text-lg text-slate-600 dark:text-slate-400">
//         We gather weekly to worship God, study His Word, and strengthen one another in faith.
//       </p>
//     </div>

//     {/* TOP GRID (Scripture + Timeline) */}
//   <div className="grid md:grid-cols-2 gap-20 lg:gap-24 items-start">
//       {/* SCRIPTURE IMAGE */}
//       <div className="relative overflow-hidden rounded-3xl shadow-lg">
//         <img
//           src="/main-header1.jpg"
//           alt="Seek first the kingdom of God"
//           className="h-72 md:h-80 w-full object-cover"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/60" />
//         <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
//           <blockquote className="italic text-lg leading-relaxed max-w-md">
//             “Seek ye first the kingdom of God, and his righteousness;
//             and all these things shall be added unto you.”
//           </blockquote>
//           <span className="mt-3 text-sm font-medium text-white/90">
//             — Matthew 6:33 (KJV)
//           </span>
//         </div>
//       </div>

//       {/* SERVICE TIMELINE CARD — unchanged */}
//       <Link href="/schedules" className="block">
//         <Card className="
//           rounded-3xl border-0 p-10 sm:p-8
//           text-center space-y-2
//           bg-white/70 dark:bg-slate-900/80
//           backdrop-blur
//           hover:-translate-y-1
//           transition
//           cursor-pointer
//         ">
//           <div className="mx-auto w-fit rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
//             <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//           </div>

//           <CardHeader>
//             <CardTitle className="text-2xl">
//               Service Timeline
//             </CardTitle>
//           </CardHeader>

//           <CardContent className="text-lg text-slate-800 dark:text-slate-200">
//             See highlights from our recent and upcoming services.
//           </CardContent>

//           <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-lg">
//             View Service Timeline <ChevronsRight className="w-5 h-5 mt-1" />
//           </span>
//         </Card>
//       </Link>
//     </div>

//     {/* SCHEDULE — FULL WIDTH BELOW */}
//     <div className="max-w-4xl mx-auto">
//       <WeeklyScheduleCard />
//     </div>

//   </div>

//   <div className="absolute bottom-0 z-10 left-0 w-full pointer-events-none">
//     <CurveWaveResponsive />
//   </div>
// </section>







      {/* <hr className="max-w-7xl mx-auto my-20 border-slate-200 dark:border-slate-800" /> */}

      {/* WHY WE EXIST */}
       {/* <section className="relative bg-yellow-50 py-20 dark:bg-slate-950 text-center space-y-10">
         <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-6 py-20">
          <h2 className="text-3xl font-bold">Why We Exist</h2>

            <p className="text-lg max-w-3xl mx-auto text-slate-600">
              We seek to glorify God by following Christ and the teachings of the New Testament.
            </p>

          <blockquote className="italic text-slate-500">
            “Let all that you do be done in love.”
            <span className="block mt-2 not-italic font-medium">
              — 1 Corinthians 16:14 (KJV)
            </span>
          </blockquote>
          </div>
        </section> */}




        