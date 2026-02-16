// app/bible-studies/[...slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ChevronsLeft,
         ChevronRight, 
         BookMarked,
         Download, 
         CalendarClock, 
         Megaphone,
         Mic,  
         BookOpen } from "lucide-react";


function getFileExtension(url: string) {
  const clean = url.split("?")[0];
  const parts = clean.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function makeDownloadName(title: string, url: string) {
  const ext = getFileExtension(url);
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return ext ? `${safeTitle}.${ext}` : safeTitle;
}

/* ---------------- TYPES ---------------- */

type Category = {
  id: number;
  name: string;
};

type BibleStudy = {
  id: number;
  title: string;
  speaker?: string | null;
  description?: string | null;
  outline?: string | null;
  content?: string | null;
  studyDate: string;

  imageUrl?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  documentUrl?: string | null;

  category?: Category | null;
};

/* ---------------- DATA FETCH ---------------- */

async function getBibleStudy(id: string): Promise<BibleStudy | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/bible-studies/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

/* ---------------- PAGE ---------------- */

// export default async function BibleStudyDetailPage({
//   params,
// }: {
//   // params: Promise<{ id: string }>;
//   params: Promise<{ slug: string[] }>;

// }) {
//   // ✅ REQUIRED IN NEXT 15 / 16
//   const { id } = await params;

//   const item = await getBibleStudy(id);
//   if (!item) return notFound();

export default async function BibleStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  const raw = slug?.[0] ?? "";
  const id = raw.split("-")[0]; // ✅ get "4"

  if (!id) return notFound();

  const item = await getBibleStudy(id);
  if (!item) return notFound();


  const daysDiff =
  (Date.now() - new Date(item.studyDate).getTime()) /
  (1000 * 60 * 60 * 24);

  const isLatest = daysDiff <= 7;


  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const relatedByCategory = item.category
    ? await fetch(
        `${base}/api/bible-studies?categoryId=${item.category.id}&excludeId=${item.id}&limit=3`,
        { cache: "no-store" }
      ).then(r => r.json())
    : [];


    let relatedStudies = relatedByCategory;

if (relatedStudies.length < 3 && item.speaker) {
  const relatedBySpeaker = await fetch(
    `${base}/api/bible-studies?speaker=${encodeURIComponent(
      item.speaker
    )}&excludeId=${item.id}&limit=${3 - relatedStudies.length}`,
    { cache: "no-store" }
  ).then(r => r.json());

  relatedStudies = [...relatedStudies, ...relatedBySpeaker];

  // ✅ REMOVE DUPLICATES BY ID
  relatedStudies = Array.from(
    new Map(relatedStudies.map((s: BibleStudy) => [s.id, s])).values()
  );
}

  return (
    <div className="max-w-7xl mx-auto px-4 pt-[calc(72px+2rem)] sm:px-6 lg:px-8 pb-8 sm:pb-12 space-y-10">

      {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          {/* <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-blue-600 transition"
          >
            <Home className="w-4 h-4" />
            Home
          </Link> */}

          <BookMarked className="w-4 h-4" />

          <Link
            href="/bible-studies"
            className="hover:text-blue-600 transition"
          >
            Bible Studies
          </Link>

          <ChevronRight className="w-4 h-4" />

          <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-200 font-medium">
            {item.title}
          </span>
        </nav>

        {/* HERO MEDIA */}
        <section className="relative overflow-hidden rounded-2xl border">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full max-h-[420px] object-cover"
            />
          ) : (
            <div className="h-[280px] bg-slate-900" />
          )}
            {/* 🔥 LATEST STUDY BADGE */}
            {isLatest && (
              <span className="
                absolute top-4 left-4 z-10
                rounded-full
                bg-sky-600 text-white
                text-xs font-semibold
                px-3 py-1
                shadow-md
              ">
                Latest Study
              </span>
            )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              {item.title}
            </h1>
            {/* <p className="text-sm sm:text-base text-white/80 max-w-2xl">
              A focused Bible study exploring God’s Word with clarity and application.
            </p> */}

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                {format(new Date(item.studyDate), "MMM d, yyyy")}
              </span>

              {item.speaker && (
                <span className="inline-flex items-center gap-2">
                  <Megaphone className="w-4 h-4" />
                  {item.speaker}
                </span>
              )}
            </div>

          {/* CATEGORY */}
          {item.category && (
            <Link
              href={`/bible-studies?category=${item.category.id}`}
              scroll={false}
              className="
                inline-block w-fit
                text-xs sm:text-sm
                bg-slate-100 dark:bg-slate-800
                hover:bg-slate-200 dark:hover:bg-slate-700
                text-slate-700 dark:text-slate-200
                px-3 py-1.5
                rounded-full
                transition
              "
            >
              {item.category.name}
            </Link>
          )}
          </div>
        </section>   

      {/* IMAGE */}
      {/* {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="
          w-full
          max-h-[260px] sm:max-h-[360px] md:max-h-[420px]
          object-cover
          rounded-2xl
          border
        "
        />
      )} */}

      {/* DESCRIPTION */}
      {item.description && (
        <section className="
            space-y-2
            prose
            prose-sm sm:prose-base
            dark:prose-invert
            max-w-none
            whitespace-pre-line
          ">

          <h2 className="text-lg font-semibold">Description</h2>
          <p className="text-md text-slate-800 dark:text-slate-100">
          {item.description}
          </p>
        </section>
      )}

      {/* LINE SEPARATOR*/}
      <hr className="border-t border-slate-200 dark:border-slate-800" />

      <section className="
        rounded-2xl
        border-l-4 border-blue-600
        bg-blue-50 dark:bg-slate-900/60
        p-6
        space-y-3
      ">
        <p className="italic text-lg text-slate-800 dark:text-slate-200">
          “All scripture is given by inspiration of God, and is profitable for doctrine,
          for reproof, for correction, for instruction in righteousness.”
        </p>

        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          — 2 Timothy 3:16 (KJV)
        </p>
      </section>


      {/* VIDEO */}
      {item.videoUrl && (
        <section className="space-y-4">      
          <h2 className="text-xl font-semibold text-center">Watch the Bible Study</h2>
           <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
            <video controls className="w-full h-full object-contain">
              <source src={item.videoUrl} />
            </video>
          </div>
        </section>
      )}

    {/* AUDIO & DOCUMENT SECTION */}
    <section className="rounded-2xl border bg-white dark:bg-slate-900 p-6 space-y-6">
      <h2 className="text-xl font-semibold">Study Materials</h2>
      {/* AUDIO */}
      {item.audioUrl && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Listen</h2>
          <audio controls className="w-full">
            <source src={item.audioUrl} />
          </audio>
        </section>
      )}

      {/* DOCUMENT / DOWNLOAD */}
      {item.documentUrl && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Document</h2>

          {/* Desktop / Tablet Preview (PDF only) */}
          {item.documentUrl.endsWith(".pdf") && (
            <div className="hidden sm:block">
              <iframe
                src={item.documentUrl}
                className="w-full h-[360px] sm:h-[480px] md:h-[600px] border rounded-lg"
              />
            </div>
          )}
          {/* View / Download (all devices) */}
          <a
            href={item.documentUrl}
            download={makeDownloadName(item.title, item.documentUrl)}
            className="
              inline-flex
              items-center
              text-sm
              font-medium
              text-blue-600
              hover:text-blue-700
              underline
            "
          >
              <Download className="w-4 h-4 mr-1" />
               Download Document
            </a>
          </section>
        )}
      </section>

          {/* OUTLINE */}
          {item.outline && (
          <details className="
            group
            rounded-2xl
            border-2 border-blue-600/20
            bg-blue-50/50 dark:bg-slate-900
            p-6
          ">

            <summary className="
              cursor-pointer
              font-semibold
              text-lg
              flex items-center justify-between
              list-none
            ">
              Study Outline
              <span className="text-slate-700 dark:text-slate-100 group-open:rotate-180 transition">
                ▼
              </span>
            </summary>

            <div className="
              mt-4
              prose prose-sm sm:prose-base
              dark:prose-invert
              max-w-none
              whitespace-pre-line
            ">          
            <h1 className="text-xl text-center pb-8 sm:text-2xl md:text-2xl font-bold leading-tight">
              {item.title}
            </h1>
              {item.outline}
            </div>
          </details>
        )}

          {/* CONTENT & EXPLANATION */}
          {item.content && (
          <details className="
            group
            rounded-2xl
            border-2 border-blue-600/20
            bg-blue-50/50 dark:bg-slate-900
            p-6
          ">
            <summary className="
              cursor-pointer
              font-semibold
              text-lg
              flex items-center justify-between
              list-none
            ">
               Preaching Content
              <span className="text-slate-700 dark:text-slate-100 group-open:rotate-180 transition">
                ▼
              </span>
            </summary>

            <div className="
              mt-4
              prose prose-sm sm:prose-base
              dark:prose-invert
              max-w-none
              whitespace-pre-line
            ">          
             {item.content}
            </div>
          </details>
        )}
        
      {/* ---------------- RELATED BIBLE STUDIES ---------------- */}
    <div className="pt-8 border-t">
      {relatedStudies.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">
            Related Bible Studies
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedStudies.map((r: BibleStudy) => (
              <Link
                key={r.id}
                href={`/bible-studies/${r.id}-${r.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")}`}
                className="
                  group
                  rounded-2xl
                  border
                  bg-white dark:bg-slate-900
                  overflow-hidden
                  transition
                  hover:shadow-xl hover:-translate-y-1
                "
              >
           
                {/* IMAGE */}
                {r.imageUrl ? (
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    className="
                      h-40 w-full object-cover
                      transition-transform
                      group-hover:scale-105
                    "
                  />
                ) : (
                  <div className="h-40 bg-slate-200 dark:bg-slate-800" />
                )}

                {/* CONTENT */}
                <div className="p-4 space-y-2">
                  <span className="
                    inline-flex items-center gap-1
                    text-xs text-slate-500
                  ">
                   {r.category?.id === item.category?.id ? (
                      <>
                        <BookOpen className="w-3 h-3" />
                        Related Topic
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3" />
                        From the Same Speaker
                      </>
                    )}
                  </span>
                  
                  <h3 className="font-semibold line-clamp-2 group-hover:text-blue-600">
                    {r.title}
                  </h3>

                  {r.speaker && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {r.speaker}
                    </p>
                  )}

                  <p className="text-xs text-slate-400">
                    {format(new Date(r.studyDate), "MMM d, yyyy")}
                  </p>

                  {r.category && (
                    <span className="inline-block text-xs mt-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-slate-800">
                      {r.category.name}
                    </span>
                  )}
           
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
      {/* BACK TO LIST */}
        <div className="pt-8 border-t">
          <Link
            href="/bible-studies"
                className="
                inline-flex items-center gap-1.5
                px-4 py-2
                rounded-full
                border
                text-sm sm:text-base
                font-semibold
                text-blue-800
                dark:text-white
                hover:bg-slate-200
                dark:hover:bg-slate-800
                transition
              "
             >
            <ChevronsLeft className="w-5 h-5" />
            All Bible Studies
          </Link>
        </div>
        {/* <Link
          href="/bible-studies"
          className="fixed bottom-10 sm:bottom-12 left-6 z-50
                    inline-flex items-center gap-1.5
                    bg-sky-700/60 text-white
                    backdrop-blur-lg
                    px-4 py-1.5 rounded-full
                    shadow-lg hover:bg-blue-600 transition"
        >
         <ChevronsLeft className="w-5 h-5" /> All Studies
        </Link> */}
    </div>
  );
}




      // {/* HEADER */}
      //   <header className="space-y-4 pt-2 sm:pt-6">
      //     <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
      //       {item.title}
      //     </h1>

      //     {/* META */}
      //     <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base text-slate-600 dark:text-slate-300">
      //       <span className="inline-flex items-center gap-2">
      //         <CalendarClock className="w-4 h-4 text-blue-600" />
      //         {format(new Date(item.studyDate), "MMM d, yyyy • h:mm a")}
      //       </span>

      //       {item.speaker && (
      //         <span className="inline-flex items-center gap-2">
      //           <Megaphone className="w-4 h-4 text-blue-600" />
      //           <span className="font-medium text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-xl">
      //             {item.speaker}
      //           </span>
      //         </span>
      //       )}
      //     </div>

      //     {/* CATEGORY */}
      //     {item.category && (
      //       <Link
      //         href={`/bible-studies?category=${item.category.id}`}
      //         scroll={false}
      //         className="
      //           inline-block w-fit
      //           text-xs sm:text-sm
      //           bg-slate-100 dark:bg-slate-800
      //           hover:bg-slate-200 dark:hover:bg-slate-700
      //           text-slate-700 dark:text-slate-200
      //           px-3 py-1.5
      //           rounded-full
      //           transition
      //         "
      //       >
      //         {item.category.name}
      //       </Link>
      //     )}
      //   </header>
