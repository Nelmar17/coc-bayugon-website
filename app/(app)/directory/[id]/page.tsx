import GalleryViewer from "@/components/GalleryViewer";
import { notFound } from "next/navigation";
import Link from "next/link";
import SingleDirectoryMap from "@/components/SingleDirectoryMap";
import CurveWave from "@/components/ui/CurveWave";
import CurveWaveResponsive from "@/components/ui/CurveWaveResponsive";
// import WaveDivider from "@/components/ui/WaveDivider";
import WhatToExpect from "@/components/WhatToExpect";


// import MasonryGallery from "@/components/MasonryGallery";

type GalleryGroup = {
  title: string;      // e.g. "Gospel Meeting 2024"
  date?: string;      // optional
  images: string[];
};

import {
  ChevronsLeft,
  ChevronsRight, 
  Clock, 
  Users,
  MapPin,
  Phone,
  User,
  Home,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type Props = {
  params: Promise<{ id: string }>;
};


type DetailsProps = {
  d: {
    address?: string;
    location?: string;
    worshipTimes?: string;
    preacherName?: string;
    elders?: string;
    contactNumber?: string;
  };
};

/* ---------------- DATA ---------------- */
async function getDirectory(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/directory/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

/* ---------------- SEO ---------------- */
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const d = await getDirectory(id);

  if (!d) return { title: "Congregation Not Found" };

  return {
    title: d.congregationName,
    description: `Welcome to ${d.congregationName}`,
  };
}

/* ---------------- PAGE ---------------- */
export default async function Page({ params }: Props) {
  const { id } = await params;
  const d = await getDirectory(id);

  if (!d) return notFound();

//   const groups: GalleryGroup[] = [
//   {
//     title: "Worship Services",
//     images: d.gallery ?? [],
//   },
// ];

  return (
     <div className="bg-white dark:bg-slate-950 ">
      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden ">
        <div className="
            relative
            h-[60vh]
            sm:h-[50vh]
            md:h-[60vh]
            min-h-[280px]
            md:min-h-[360px]
            w-full
          ">
          {d.mainPhoto ? (
            <img
              src={d.mainPhoto}
              alt={d.congregationName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-900" />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />

          <div className="relative z-10 flex items-center h-full">
            <div className="max-w-7xl just mx-auto w-full px-4 pb-16">
              
              {/* <Link
                href="/directory"
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
              >
                <ChevronsLeft className="w-4 h-4" />
                Back to Directory
              </Link> */}

              <p className="uppercase tracking-widest text-lg sm:text-xl text-blue-300 ">                   
                  <span className="block">
                    Local Congregation of
                  </span>         
              </p>
              
              <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                {d.congregationName}
              </h1>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/90">
                {d.location && (
                  <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                    <MapPin className="w-4 h-4" />
                    {d.location}
                  </span>
                )}

                {d.preacherName && (
                  <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                    <User className="w-4 h-4" />
                    {d.preacherName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      <div className="absolute bottom-0 left-0 w-full pointer-events-none">
        <CurveWave />
        {/* <CurveWaveResponsive className="absolute inset-0 opacity-40" /> */}
    </div>
  </section>

      {/* ================= WELCOME + VERSE ================= */}
      <section className="max-w-7xl mx-auto px-4 -mt-32 sm:-mt-36 pb-10 sm:pb-16 relative z-20">
          <div className="
            rounded-3xl
            bg-white/80 dark:bg-slate-900/80
            backdrop-blur
            shadow-xl
            p-6 sm:p-8
            space-y-4
            text-center
          ">
          <h2 className="text-2xl sm:text-4xl py-2 sm:py:4 font-bold text-slate-900 dark:text-slate-100 ">
            Welcome to {d.congregationName} 
            <span className="block pt-2 sm:pt-4">
              Church of Christ
            </span>
          </h2>
          {d.welcomeMessage && (
            <p className="text-lg leading-relaxed px-6 text-slate-800 dark:text-slate-100">
              {d.welcomeMessage}
            </p>
          )}

          {(d.bibleVerse || d.bibleRef) && (
            <blockquote className="italic text-slate-700 dark:text-slate-300">
              {d.bibleVerse && <>“{d.bibleVerse}”</>}
              {d.bibleRef && (
                <span className="block mt-2 not-italic text-md text-slate-700 dark:text-slate-200">
                  — {d.bibleRef}
                </span>
              )}
            </blockquote>
          )}
        <div className="flex flex-col sm:flex-row py-6 sm:py-6  justify-center gap-4">
            <div className="flex justify-center">
              <Link
                href="/contact"
                className="
                  inline-flex items-center gap-1.5
                  whitespace-nowrap
                  rounded-full
                  bg-blue-600 text-white font-semibold
                  hover:bg-blue-700 transition
                   px-4 py-2 text-md
                  sm:px-6 sm:py-3 sm:text-base
                  shadow-xl
                "
              >
                Let’s Connect
                <ChevronsRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GALLERY ================= */}
      {d.gallery?.length > 0 && (
        <section className="max-w-full overflow-hidden mx-auto px-2 sm:px-4 py-2 sm:pb-12 pt-24 sm:pt-32">
          {/* <h2 className="text-2xl md:text-4xl font-bold text-center">
            Life in Our Congregation
          </h2> */}
          <GalleryViewer images={d.gallery} />
        </section>
      )}

      {/* {groups.map((g) => (
        <section key={g.title} className="max-w-full mx-auto px-4 py-16 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold">{g.title}</h3>
            {g.date && <p className="text-sm text-slate-500">{g.date}</p>}
          </div>
         
          <GalleryViewer images={g.images} />
          <MasonryGallery images={g.images} />
        </section>
      ))} */}

  
      {/* ================= DETAILS ================= */}
    <section className="relative z-20 pt-12 sm:pt-24 bg-white dark:bg-slate-950">
        {/* ================= CONTENT ================= */}
          {/* INTRO (still constrained) */}
          <div className="max-w-7xl mx-auto px-4 space-y-6 pb-12 sm:pb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Join Us for Worship
            </h2>

            <p className="text-lg text-slate-700 dark:text-slate-200">
              Let us not grow weary in doing good, but remain steadfast in faith and love, 
              trusting in God’s promises. As we are given opportunity, let us continue to do good unto all, 
              showing kindness, compassion, and sincerity, especially to those who belong to the household of faith. 
              By doing so, we reflect God’s love and strengthen one another in our shared walk of faith. (Galatians 6:9–10)
            </p>
          </div>

          {/* ================= CARDS ================= */}
        {/* CARDS — HALF OVERLAP */}
       <div className="relative max-w-7xl mx-auto px-4 -mb-[80px] z-30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* LOCATION */}
              {(d.address || d.location) && (
                <div className="rounded-2xl bg-white/40 dark:bg-slate-900/50 backdrop-blur-xl p-6 space-y-4 shadow-lg ">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-200">
                    Location
                  </h3>

                  <div className="space-y-3 text-slate-800 dark:text-slate-200">
                    {d.address && (
                      <p className="flex gap-3">
                        <Home className="w-5 h-5 text-blue-600 shrink-0" />
                        <span>
                          <b>Address</b>
                          <br />
                          {d.address}
                        </span>
                      </p>
                    )}

                    {d.location && (
                      <p className="flex gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                        <span>
                          <b>Area</b>
                          <br />
                          {d.location}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* WORSHIP SCHEDULE */}
              {d.worshipTimes && (
                <div className="rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-6 space-y-4 shadow-lg">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-200">
                    Worship Schedule
                  </h3>

                  <div className="flex gap-3 text-slate-800 dark:text-slate-200">
                    <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      {d.worshipTimes.split("\n").map((t: string, i: number) => (
                        <div key={i}>{t}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* LEADERSHIP & CONTACT */}
              {(d.preacherName || d.elders || d.contactNumber) && (
                <div className="rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-6 space-y-4 shadow-lg">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-200">
                    Leadership & Contact
                  </h3>

                  <div className="space-y-3 text-slate-800 dark:text-slate-200">
                    {d.preacherName && (
                      <p className="flex gap-3">
                        <User className="w-5 h-5 text-blue-600 shrink-0" />
                        <span>
                          <b>Preacher</b>
                          <br />
                          {d.preacherName}
                        </span>
                      </p>
                    )}

                    {d.elders && (
                      <p className="flex gap-3">
                        <Users className="w-5 h-5 text-blue-600 shrink-0" />
                        <span>
                          <b>Elders</b>
                          <br />
                          {d.elders}
                        </span>
                      </p>
                    )}

                    {d.contactNumber && (
                      <p className="flex gap-3">
                        <Phone className="w-5 h-5 text-blue-600 shrink-0" />
                        <span>
                          <b>Contact</b>
                          <br />
                          {d.contactNumber}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
         {/* ================= WAVE DIVIDER ================= */}
        <div className="absolute bottom-0 z-10 left-0 w-full pointer-events-none">
      <CurveWaveResponsive direction="normal" baseClass="fill-blue-50 dark:fill-slate-950"/>
    </div>
  </section>

      {/* <WaveDivider /> */}

      {/* ================= MAP ================= */}
 <section className="relative bg-cyan-100 dark:bg-gray-950 pt-[160px] sm:pt-[180px] pb-12">
   <div className="relative z-10 max-w-7xl mx-auto px-4 space-y-6">
    <header className="text-center sm:text-left">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-200">
        Directions to {d.congregationName}
      </h2>
      <p className="mt-1 text-md text-slate-600 dark:text-slate-400">
        Find us easily using the map below
      </p>
    </header>

    {d.latitude && d.longitude && (
      <div
        className="
          mt-6
          rounded-2xl
          overflow-hidden
          border
          bg-white dark:bg-slate-900
          shadow-sm

          h-[260px]          /* 📱 mobile */
          sm:h-[320px]       /* tablet */
          md:h-[420px]       /* small desktop */
          lg:h-[520px]       /* 🖥 desktop */
          xl:h-[580px]       /* big screens */
        "
      >
        <SingleDirectoryMap
          latitude={d.latitude}
          longitude={d.longitude}
          congregationName={d.congregationName}
          location={d.location}
        />
      </div>
    )}
  </div>
  
      {/* ================= CTA ================= */}
          <section className="py-14 sm:py-24 pt-28 sm:pt-32">
            <div
              className="
                mx-auto
                px-4
                flex
                flex-col
                sm:flex-row
                justify-center
                items-center
                gap-3
                max-w-lg
              "
            >
              {/* View all congregations (always visible) */}
              <Link
                href="/directory"
                className="
                  inline-flex
                  items-center
                  gap-0.5
                  whitespace-nowrap
                  text-md
                  px-5 py-3
                  sm:px-6 sm:py-3
                  rounded-full
                  border border-blue-600
                  text-blue-700 dark:text-blue-300
                  text-sm sm:text-base font-semibold
                  hover:bg-blue-50 dark:hover:bg-slate-900/60
                  shadow-lg
                  transition
                "
              >
                <ChevronsLeft className="w-5 h-5 sm:w-5 sm:h-5" /> View all congregations 
              </Link>

              {/* 📱 MOBILE ONLY: Call */}
              {d.contactNumber && (
                <a
                  href={`tel:${String(d.contactNumber).replace(/\s+/g, "")}`}
                  className="
                    inline-flex
                    items-center
                    gap-0.5
                    sm:hidden
                    whitespace-nowrap
                    px-5 py-3
                    rounded-full
                    bg-blue-600
                    text-white
                    text-sm font-semibold
                    hover:bg-blue-700
                    shadow-lg
                    transition
                  "
                >
                  Call this congregation <ChevronsRight className="w-5 h-5 sm:w-5 sm:h-5" />
                </a>
              )}
              {/* 🖥 DESKTOP ONLY: Contact Us */}
              <Link
                href="/contact"
                  className="
                  hidden sm:inline-flex
                  whitespace-nowrap gap-1.5
                  items-center
                  px-5 py-3
                  sm:px-6 sm:py-3
                  rounded-full
                  bg-blue-600
                  text-white
                  text-sm sm:text-base font-semibold
                  hover:bg-blue-700
                  shadow-lg
                  transition
                "
              >
                Let’s Connect <ChevronsRight className="w-5 h-5 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </section>
        </section>                
       {/* ================= WHAT TO EXPECT ================= */}
     <WhatToExpect compact />
    </div>
  );
}




  //  <section className="relative overflow-hidden py-8 sm:py-4">

  //     {/* 🌊 BACKGROUND WAVE */}
  //     <div className="absolute inset-0 pointer-events-none">
  //       <CurveWaveResponsive className="absolute bottom-0 left-0 w-full opacity-60" />
  //     </div>

  //     {/* CONTENT */}
  //     <div className="relative z-10 max-w-7xl mx-auto px-4">

  //      {/* <section className="max-w-7xl mx-auto px-4 py-6"> */}

  //       {/* Join Us for Worship */}
  //       <div className="max-w-7xl mx-auto space-y-6 py-12 sm:py-16 ">
  //           <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
  //                Join Us for Worship
  //           </h2>
  //             <p className="text-lg text-slate-900 dark:text-slate-100">
  //               Let us not grow weary in doing good, but remain steadfast in faith and love, 
  //               trusting in God’s promises. As we are given opportunity, 
  //               let us continue to do good unto all, showing kindness, compassion, and sincerity, 
  //               especially to those who belong to the household of faith. By doing so, 
  //               we reflect God’s love and strengthen one another in our shared walk of faith. (Galatians 6:9–10)
  //             </p>
  //            {/* <span className="block not-italic mt-2 text-md font-medium text-slate-800 dark:text-slate-200">
  //             </span> */}             
  //       </div>

  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  //             {/* ADDRESS */}
  //             {(d.address || d.location) && (
  //               // <div className="rounded-2xl bg-blue-50/80 dark:bg-slate-900/60 backdrop-blur p-6 space-y-4">
  //                <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 space-y-4 shadow-lg">
  //                 <h2 className="text-2xl font-medium text-slate-900 dark:text-slate-200">Location</h2>
  //                 <div className="space-y-3 text-slate-800 dark:text-slate-200 text-md sm:text-base">
  //                   {d.address && (
  //                     <p className="flex gap-3">
  //                       <Home className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
  //                       <span>
  //                         <b>Address</b>
  //                         <br />
  //                         {d.address}
  //                       </span>
  //                     </p>
  //                   )}

  //                   {d.location && (
  //                     <p className="flex gap-3">
  //                       <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
  //                       <span>
  //                         <b>Area</b>
  //                         <br />
  //                         {d.location}
  //                       </span>
  //                     </p>
  //                   )}
  //                 </div>
  //               </div>
  //             )}
  //             {/* WORSHIP SCHEDULE */}
  //             {d.worshipTimes && (
  //               <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 space-y-4 shadow-lg">
  //                 <h2 className="text-2xl font-medium text-slate-900 dark:text-slate-200">Worship Schedule</h2>

  //                 <div className="text-slate-800 dark:text-slate-200 text-md sm:text-base">
  //                   <div className="flex gap-3">
  //                     <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
  //                     <div>
  //                       {d.worshipTimes.split("\n").map((t: string, i: number) => (
  //                         <div key={i} className="leading-relaxed">
  //                           {t}
  //                         </div>
  //                       ))}
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             )}

  //             {/* LEADERSHIP & CONTACT */}
  //             {(d.preacherName || d.contactNumber || d.elders) && (
  //              <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 space-y-4 shadow-lg">
  //                 <h2 className="text-2xl font-medium text-slate-900 dark:text-slate-200">Leadership & Contact</h2>

  //                 <div className="space-y-3 text-slate-800 dark:text-slate-200 text-md sm:text-base">
  //                   {d.preacherName && (
  //                     <p className="flex gap-3">
  //                       <User className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
  //                       <span>
  //                         <b>Preacher</b>
  //                         <br />
  //                         {d.preacherName}
  //                       </span>
  //                     </p>
  //                   )}

  //                   {d.elders && (
  //                     <p className="flex gap-3">
  //                       <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
  //                       <span>
  //                         <b>Elders</b>
  //                         <br />
  //                         {d.elders}
  //                       </span>
  //                     </p>
  //                   )}

  //                   {d.contactNumber && (
  //                     <p className="flex gap-3">
  //                       <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
  //                       <span>
  //                         <b>Contact</b>
  //                         <br />
  //                         {d.contactNumber}
  //                       </span>
  //                     </p>
  //                   )}
  //                 </div>
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //       {/* </section> */}
  //   </section>












// import GalleryViewer from "@/components/GalleryViewer";
// import { notFound } from "next/navigation";
// import Link from "next/link";
// import SingleDirectoryMap from "@/components/SingleDirectoryMap";
// import { ChevronsLeft, MapPin, Phone, User, Home } from "lucide-react";

// type Props = {
//   params: Promise<{ id: string }>;
// };

// async function getDirectory(id: string) {
//   const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
//   const res = await fetch(`${base}/api/directory/${id}`, { cache: "no-store" });
//   if (!res.ok) return null;
//   return res.json();
// }

// /* ---------------- SEO ---------------- */
// export async function generateMetadata({ params }: Props) {
//   const { id } = await params;
//   const d = await getDirectory(id);

//   if (!d) return { title: "Congregation Not Found" };

//   return {
//     title: d.congregationName,
//     description: `Welcome to ${d.congregationName}`,
//   };
// }

// /* ---------------- PAGE ---------------- */
// export default async function Page({ params }: Props) {
//   const { id } = await params;
//   const d = await getDirectory(id);

//   if (!d) return notFound();

//   return (
//     <>
//       {/* HERO */}
//       <section className="relative isolate overflow-hidden -mt-16">
//         <div className="relative h-[42vh] sm:h-[55vh] min-h-[340px] w-full">
//           {d.mainPhoto ? (
//             <img
//               src={d.mainPhoto}
//               alt={d.congregationName}
//               className="absolute inset-0 w-full h-full object-cover"
//             />
//           ) : (
//             <div className="absolute inset-0 bg-slate-900" />
//           )}

//           <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/85" />

//           <div className="relative z-10 flex items-end h-full">
//             <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-8 sm:pb-12">
//               <Link
//                 href="/directory"
//                 className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white"
//               >
//                 <ChevronsLeft className="w-4 h-4" />
//                 Back to Directory
//               </Link>

//               <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
//                 {d.congregationName}
//               </h1>

//               <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/90">
//                 <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
//                   <MapPin className="w-4 h-4" />
//                   {d.location}
//                 </span>

//                 {d.preacherName && (
//                   <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
//                     <User className="w-4 h-4" />
//                     {d.preacherName}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CONTENT */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
//         <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
//           {/* LEFT: Gallery */}
//           <div className="space-y-4">
//             <h2 className="text-xl font-bold">Gallery</h2>
//             <GalleryViewer images={d.gallery ?? []} />
//           </div>

//           {/* RIGHT: Info */}
//           <div className="space-y-6">

            
//             <div className="rounded-2xl border bg-white/80 dark:bg-slate-900/60 backdrop-blur p-6 space-y-4">
//               <h2 className="text-xl font-bold">Welcome</h2>

//               {d.welcomeMessage && (
//                 <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
//                   {d.welcomeMessage}
//                 </p>
//               )}

//               {(d.bibleVerse || d.bibleRef) && (
//                 <blockquote className="rounded-xl border bg-slate-50 dark:bg-slate-950/40 p-4">
//                   {d.bibleVerse && (
//                     <p className="italic text-slate-700 dark:text-slate-200">
//                       “{d.bibleVerse}”
//                     </p>
//                   )}
//                   {d.bibleRef && (
//                     <p className="mt-2 text-sm text-slate-500">
//                       — {d.bibleRef}
//                     </p>
//                   )}
//                 </blockquote>
//               )}
//             </div>


//             <div className="rounded-2xl border bg-white/80 dark:bg-slate-900/60 backdrop-blur p-6">
//               <h2 className="text-xl font-bold mb-4">Details</h2>
              

//               <div className="space-y-3 text-sm sm:text-base text-slate-700 dark:text-slate-200">
//                 {d.location && (
//                   <p className="flex items-start gap-2">
//                     <MapPin className="w-5 h-5 mt-0.5 text-slate-500" />
//                     <span><b>Location:</b> {d.location}</span>
//                   </p>
//                 )}

//                 {d.address && (
//                   <p className="flex items-start gap-2">
//                     <Home className="w-5 h-5 mt-0.5 text-slate-500" />
//                     <span><b>Address:</b> {d.address}</span>
//                   </p>
//                 )}

//                 {d.preacherName && (
//                   <p className="flex items-start gap-2">
//                     <User className="w-5 h-5 mt-0.5 text-slate-500" />
//                     <span><b>Preacher(s):</b> {d.preacherName}</span>
//                   </p>
//                 )}

//                 {d.contactNumber && (
//                   <p className="flex items-start gap-2">
//                     <Phone className="w-5 h-5 mt-0.5 text-slate-500" />
//                     <span><b>Contact:</b> {d.contactNumber}</span>
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//       <div className="space-y-12">
          
//           <div className=" max-w-7xl mx-auto rounded-2xl border backdrop-blur bg-white/80 dark:bg-slate-900/60 p-5">
//             {d.latitude && d.longitude && (
//                 <div className="space-y-3">
//                   <h2 className="text-xl font-bold">Map Location</h2>

//                   <SingleDirectoryMap
//                     latitude={d.latitude}
//                     longitude={d.longitude}
//                     congregationName={d.congregationName}
//                     location={d.location}
//                   />
//                 </div>
//               )}
//           </div>

//             {/* Optional: CTA */}
//             <div className="flex flex-col justify-center sm:flex-row gap-3">
//               <Link
//                 href="/directory"
//                 className="px-5 py-3 rounded-full border font-semibold text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition"
//               >
//                 View all congregations
//               </Link>

//               {d.contactNumber && (
//                 <a
//                   href={`tel:${String(d.contactNumber).replace(/\s+/g, "")}`}
//                   className="px-5 py-3 rounded-full bg-blue-600 text-white font-semibold text-center hover:bg-blue-700 transition"
//                 >
//                   Call this congregation
//                 </a>
//               )}
//             </div>
//          </div>
//       </div>
//     </>
//   );
// }
