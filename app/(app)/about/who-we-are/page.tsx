import WhoWeAreClient from "./WhoWeAreClient";

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/who-we-are`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load Who We Are");
  }

  return res.json();
}

export default async function WhoWeArePage() {
  const data = await getData();

  return <WhoWeAreClient data={data} />;
}








// import Link from "next/link";
// import { ChevronsRight } from "lucide-react";
// import CurveWave from "@/components/ui/CurveWave";
// /* =========================
//    DATA FETCHER
//    ========================= */
// async function getData() {
//   const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
//   const res = await fetch(`${base}/api/who-we-are`, {
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     throw new Error("Failed to load Who We Are");
//   }

//   return res.json();
// }

// /* =========================
//    PAGE
//    ========================= */
// export default async function WhoWeArePage() {
//   const data = await getData();

//   return (
//       <div className="space-y-6 bg-white dark:bg-slate-950">
//          {/* HEADER */}
//             <section className=" relative h-[28vh] sm:h-[45vh] md:h-[40vh] min-h-[380px] sm:min-h-[320px] -mt-16 overflow-hidden">
//               {/* Background Image */}
//               <div
//                 className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
//                 style={{
//                   backgroundImage: "url('/church-contact.jpg')",
//                 }}
//               />
//             <div className="absolute inset-0 bg-black/60" />

//            <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-2 sm:pt-14">
//               <div className="max-w-xl sm:max-w-2xl mx-auto">
//                   <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
//                     Investigate Us
//                   </h1>
//                   <p className="pt-2 sm:pt-4 text-slate-200 text-base sm:text-lg leading-relaxed">
//                     <span className="block font-semibold text-white">
//                       1 Corinthians 4:3
//                     </span>

//                     <span className="block italic">
//                      “But with me it is a very small thing that I should be judged of you,
//                     </span>

//                     <span className="block italic">
//                       of man's judgment: yea, I judge not mine own self.” 
//                     </span>
//                   </p>
//                 </div>
//               </div>
//                <div className="absolute bottom-0 left-0 w-full pointer-events-none">
//                 <CurveWave />
//                 </div>   
//           </section>

//           <div className="max-w-7xl mx-auto px-4 py-12 pb-20 space-y-10">
//             {/* HEADER */}
//             {/* Who We Are */}
//             <section className="max-w-7xl mx-auto space-y-6 pb-16">
//             <header className="space-y-3">
//               <h1 className="text-4xl font-bold">Who We Are</h1>
//               {data.intro && (
//                 <p className="text-slate-600 text-lg dark:text-slate-400 max-w-2xl">
//                   {data.intro}
//                 </p>
//               )}
//               <p className="italic text-lg text-slate-500 dark:text-slate-200">
//                 “Be ye followers of me, even as I also am of Christ.”  
//                 <span className="block not-italic mt-1"> — 1 Corinthians 11:1 (KJV) </span>
//               </p>
//             </header>
//         </section>

//         <div className="h-px w-24 mx-auto bg-slate-300 dark:bg-slate-700" />

//             <section className="max-w-3xl mx-auto text-center space-y-4 pb-16">
//                 <h2 className="text-2xl sm:text-3xl font-bold">
//                   Why We Exist
//                 </h2>

//                 <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
//                   We exist to glorify God by following the pattern of the New Testament church,
//                   teaching the Word faithfully, and encouraging one another in love and good works.
//                 </p>

//                 <p className="text-lg italic text-slate-500 dark:text-slate-200 mt-2">
//                   “And whatsoever ye do in word or deed, do all in the name of the Lord Jesus, giving thanks to God and the Father by him.”
//                    <span className="block not-italic mt-1">— Colossians 3:17 (KJV)</span>
//                 </p>

//               </section>

//             {/* CARDS */}
//             <div className="grid md:grid-cols-2 gap-8 pb-16" >
//               <InfoBlock
//                 title="Our Mission"
//                 text={data.mission}
//                 href="/about/who-we-are/our-mission"
//               />

//               <InfoBlock
//                 title="Our Belief"
//                 text={data.belief}
//                 href="/about/who-we-are/our-belief"
//               />

//               <InfoBlock
//                 title="Our Identity"
//                 text={data.identity}
//                 href="/about/who-we-are/our-identity"
//               />

//               <InfoBlock
//                 title="Our Community"
//                 text={data.community}
//                 href="/about/who-we-are/our-community"
//               />
//             </div>

//         <div className="h-px w-24 mx-auto bg-slate-300 dark:bg-slate-700" />
//            {/* Our Leadership */}
           
//             <section className="max-w-4xl mx-auto text-center space-y-6">
//               <h2 className="text-2xl sm:text-3xl font-bold text-center">Our Leadership</h2>

//               <p className="max-w-2xl mx-auto text-center text-slate-600 dark:text-slate-400 text-lg ">
//                 The church is guided by faithful men devoted to shepherding the flock
//                 according to Scripture.
//               </p>

//               <p className="italic text-center text-slate-500 dark:text-slate-200 text-lg">
//               “Take heed therefore unto yourselves, and to all the flock, over the which the Holy Ghost hath made you overseers, 
//               to feed the church of God, which he hath purchased with his own blood.”
//               <span className="block not-italic mt-1">— Acts 20:28 (KJV)</span>
//               </p>
//               <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
//               {/* later: leader cards */}
//               </div>
//             </section>


//          {/* What We Are Not */}
//               <section className="max-w-7xl mx-auto text-left bg-slate-100 dark:bg-slate-900/40 rounded-2xl p-8 space-y-4">
//                 <h2 className="text-2xl font-bold">What We Are Not</h2>

//                 <ul className="list-disc pl-6 text-lg text-slate-700 dark:text-slate-200 space-y-2">
//                   <li>We are not a denomination</li>
//                   <li>We are not founded by men</li>
//                   <li>We do not follow creeds or councils</li>
//                   <li>We strive to follow the Bible alone</li>
//                 </ul>

//                 <p className="text-md text-slate-500 ">
//                   These principles are drawn from the teachings of Scripture.
//                 </p>

//                 <p className="italic text-lg text-slate-600 dark:text-slate-300">
//                 “Now I beseech you, brethren… that there be no divisions among you.”
//                  <span className="block not-italic mt-1">— 1 Corinthians 1:10 (KJV)</span>

//               </p>

//               <p className="italic text-lg text-slate-600 dark:text-slate-300 mt-2">
//                 “Teaching for doctrines the commandments of men.”
//                  <span className="block not-italic mt-1">— Matthew 15:9 (KJV)</span>
//               </p>
//               </section>
//             </div>

//               {/* Want to Learn More */}
//               <section className="text-center space-y-4 bg-slate-100 dark:bg-slate-900/40 py-20 pb-28 ">
//               <div className="max-w-6xl mx-auto px-4 space-y-10">
//                 <h2 className="text-2xl font-bold">
//                   Want to Learn More?
//                 </h2>

//                 <p className="text-slate-600 dark:text-slate-400">
//                   We invite you to study the Scriptures with us and learn more about God's design
//                   for His church.
//                 </p>

//                 <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
//                   <Link
//                     href="/contact"
//                     className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700"
//                   >
//                     Contact Us
//                   </Link>

//                   <Link
//                     href="/bible-studies"
//                     className="px-4 py-2 rounded-full border border-blue-600 text-blue-600 font-semibold hover:bg-blue-600/10"
//                   >
//                     Study With Us
//                   </Link>
//                 </div>
//                 </div>
//               </section>


//       </div>
//     );
// }

// /* =========================
//    CARD COMPONENT
//    ========================= */
// function InfoBlock({
//   title,
//   text,
//   href,
// }: {
//   title: string;
//   text: string;
//   href: string;
// }) {
//   return (
//     <Link href={href} className="group">
//       <div className="rounded-xl border bg-background p-6 space-y-3 hover:shadow-xl hover:border-blue-800  hover:-translate-y-1 hover:scale-[1.01]
// transition-all duration-300
// ">
//         <h3 className="text-xl font-semibold group-hover:text-blue-700">
//           {title}
//         </h3>

//         {/* PREVIEW LANG */}
//         <p className="text-lg text-slate-600 dark:text-slate-400 whitespace-pre-line line-clamp-4">
//           {text}
//         </p>

//         <span className="inline-flex items-center gap-1 text-md font-semibold text-blue-600 hover:text-blue-700">
//           Read more <ChevronsRight className="w-4 h-4 mt-0.5" />
//         </span>
//       </div>
//     </Link>
//   );
// }
