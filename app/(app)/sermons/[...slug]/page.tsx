import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ChevronsLeft,
  ChevronRight,
  BookOpen,
  Download,
  CalendarClock,
  Megaphone,
} from "lucide-react";

/* ---------------- HELPERS ---------------- */

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



/* ---------------- DATA ---------------- */

async function getSermon(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/sermons/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();

  
}

async function getRelatedSermons(sermon: any) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  // 1️⃣ fetch by category (highest priority)
  const byCategory = sermon.category
    ? await fetch(
        `${base}/api/sermons?category=${encodeURIComponent(sermon.category)}`,
        { cache: "no-store" }
      ).then(r => r.json())
    : [];

  // 2️⃣ fetch by preacher (fallback)
  const byPreacher = sermon.preacher
    ? await fetch(
        `${base}/api/sermons?preacher=${encodeURIComponent(sermon.preacher)}`,
        { cache: "no-store" }
      ).then(r => r.json())
    : [];

  // 3️⃣ merge + dedupe + remove current sermon
  const merged = [...byCategory, ...byPreacher]
    .filter((s: any) => s.id !== sermon.id)
    .reduce((acc: any[], cur: any) => {
      if (!acc.find((i) => i.id === cur.id)) acc.push(cur);
      return acc;
    }, []);

  // 4️⃣ sort newest first
  return merged
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 3);
}


/* ---------------- PAGE ---------------- */

export default async function SermonDetailPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const raw = slug?.[0] ?? "";
  const id = raw.split("-")[0];

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";


  if (!id) return notFound();

  const sermon = await getSermon(id);
  if (!sermon) return notFound();

  const daysDiff =
  sermon.date
    ? (Date.now() - new Date(sermon.date).getTime()) /
      (1000 * 60 * 60 * 24)
    : Infinity;

const isLatest = daysDiff <= 7;

const relatedSermons = await getRelatedSermons(sermon);

// const related = await fetch(
//   `${base}/api/sermons?preacher=${sermon.preacher}`,
//   { cache: "no-store" }
// ).then(r => r.json());

// const relatedFiltered = related
//   .filter((s: any) => s.id !== sermon.id)
//   .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(var(--nav-height,72px)+2rem)] pb-12 space-y-12">
      {/* ---------------- BREADCRUMBS ---------------- */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        {/* <Link href="/" className="inline-flex items-center gap-1 hover:text-blue-600">
          <Home className="w-4 h-4" />
          Home
        </Link> */}
        <BookOpen className="w-4 h-4" />
        
        <Link href="/sermons" className="hover:text-blue-600">
          Sermons
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="truncate max-w-[220px] font-medium text-slate-700 dark:text-slate-200">
          {sermon.title}
        </span>
      </nav>

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden rounded-2xl border">
        {sermon.imageUrl ? (
          <img
            src={sermon.imageUrl}
            alt={sermon.title}
            className="w-full max-h-[420px] object-cover"
          />
        ) : (
          <div className="h-[280px] bg-slate-900" />
        )}


        {isLatest && (
          <span
            className="
              absolute top-4 left-4 z-10
              rounded-full
              bg-sky-600 text-white
              text-xs font-semibold
              px-3 py-1
              shadow-md
            "
          >
            Latest Sermon
          </span>
        )}


        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
            {sermon.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
            {sermon.date && (
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                {format(new Date(sermon.date), "MMM d, yyyy")}
              </span>
            )}

            {sermon.preacher && (
              <span className="inline-flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                {sermon.preacher}
              </span>
            )}           
          </div>
          {/* CATEGORY */}
                {sermon.category && (
                <span className="
                inline-block w-fit
                text-xs sm:text-sm
                bg-slate-100 dark:bg-slate-800
                hover:bg-slate-200 dark:hover:bg-slate-700
                text-slate-700 dark:text-slate-200
                px-3 py-1.5
                rounded-full
                transition
              ">
               {sermon.category}
               </span>
               )}
        </div>
      </section>

      {/* ---------------- DESCRIPTION ---------------- */}

      {sermon.description && (
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
          {sermon.description}
          </p>
        </section>
      )}

    <hr className="border-t border-slate-200 dark:border-slate-800" />

       <section
          className="
            rounded-2xl
            border-l-4 border-blue-600
            bg-blue-50 dark:bg-slate-900/60
            p-6
            space-y-3
          "
        >
          <p className="italic text-lg text-slate-800 dark:text-slate-200">
            “Preach the word; be instant in season, out of season…”
          </p>

          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            — 2 Timothy 4:2 (KJV)
          </p>
        </section>

      {/* ---------------- VIDEO ---------------- */}
      {sermon.videoUrl && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Watch the Sermon</h2>
          <div className="relative w-full aspect-video overflow-hidden rounded-xl shadow-xl bg-black">
            <video controls className="w-full h-full object-contain">
              <source src={sermon.videoUrl} />
            </video>
          </div>
        </section>
      )}


 {/* AUDIO & DOCUMENT SECTION */}
    <section className="rounded-2xl border bg-white dark:bg-slate-900 p-6 space-y-6">
      <h2 className="text-xl font-semibold">Sermon Materials</h2>
      {/* ---------------- AUDIO ---------------- */}
      {sermon.audioUrl && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Listen</h2>
          <audio controls className="w-full">
            <source src={sermon.audioUrl} />
          </audio>
        </section>
      )}

     {/* ---------------- DOCUMENT ---------------- */}
      {sermon.documentUrl && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Document</h2>

          {/* Desktop / Tablet Preview (PDF only) */}
          {sermon.documentUrl.endsWith(".pdf") && (
            <div className="hidden sm:block">
              <iframe
                src={sermon.documentUrl}
                className="w-full h-[360px] sm:h-[480px] md:h-[600px] border rounded-lg"
              />
            </div>
          )}
          {/* View / Download (all devices) */}
          <a
            href={sermon.documentUrl}
            download={makeDownloadName(sermon.title, sermon.documentUrl)}
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
    
      {/* ---------------- OUTLINE (ACCORDION) ---------------- */}
      {sermon.outline && (
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
              Sermon Outline
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
              {sermon.title}
            </h1>
              {sermon.outline}
            </div>
          </details>
        )}

       {/* ---------------- CONTENT & EXPLANATION ---------------- */}
          {sermon.content && (
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
             {sermon.content}
            </div>
          </details>
        )}

      {/* ---------------- RELATED SERMONS ---------------- */}
    <div className="pt-10 border-t">
      {relatedSermons.length > 0 ? (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Related Sermons</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedSermons.map((s: any) => {
              const isNew =
                s.date &&
                (Date.now() - new Date(s.date).getTime()) /
                  (1000 * 60 * 60 * 24) <= 7;

              return (
                <Link
                  key={s.id}
                  href={`/sermons/${s.id}-${s.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")}`}
                  className="
                    relative
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
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt={s.title}
                      className="h-40 w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="h-40 bg-slate-200 dark:bg-slate-800" />
                  )}

                  {/* NEW BADGE */}
                  {isNew && (
                    <span className="absolute top-3 left-3 bg-sky-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
                      New
                    </span>
                  )}

                  {/* CONTENT */}
                  <div className="p-4 space-y-2">

                    
                    <h3 className="font-semibold line-clamp-2 group-hover:text-blue-600">
                      {s.title}
                    </h3>

                    {s.preacher && (
                      <p className="text-sm text-slate-500">{s.preacher}</p>
                    )}

                    {s.date && (
                      <p className="text-xs text-slate-400">
                        {format(new Date(s.date), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <p className="text-slate-500 text-sm">
          No related sermons available.
        </p>
      )}
  </div>
      {/* ---------------- BACK ---------------- */}
      <div className="pt-10 border-t">
        <Link
          href="/sermons"
          className="
            inline-flex items-center gap-2
            px-4 py-2
            rounded-full
            border
            text-sm sm:text-base
            font-semibold
            hover:bg-slate-100 dark:hover:bg-slate-800
            transition
          "
        >
          <ChevronsLeft className="w-5 h-5" />
          All Sermons
        </Link>
      </div>

          {/* <Link
          href="/sermons"
          className="fixed bottom-10 sm:bottom-12 left-6 z-50
                    inline-flex items-center gap-1.5
                    bg-sky-700/60 text-white
                    backdrop-blur-lg
                    px-4 py-1.5 rounded-full
                    shadow-lg hover:bg-blue-600 transition"
        >
         <ChevronsLeft className="w-5 h-5" /> All Sermons
        </Link> */}
    </div>
  );
}
