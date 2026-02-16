// app/sermons/archive/page.tsx
import Link from "next/link";
import CurveWave from "@/components/ui/CurveWave";

async function getYears() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/sermons`, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const sermons = await res.json();

  const years = new Set<number>();
  sermons.forEach((s: any) => {
    if (s?.date) years.add(new Date(s.date).getFullYear());
  });

  return Array.from(years).sort((a, b) => b - a);
}


export default async function SermonArchivePage() {
  const years = await getYears();

  return (
    <div className="space-y-16 bg-white dark:bg-slate-950">
      {/* HEADER */}
      <section className="relative h-[28vh] sm:h-[40vh] min-h-[260px] -mt-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
          style={{ backgroundImage: "url('/church-contact.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-8 sm:pt-16">
          <div className="max-w-2xl mx-auto">
            <p className="uppercase tracking-widest text-xs sm:text-sm text-blue-300 mb-3">
              Sermon Library
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Archive by Year
            </h1>
            <p className="pt-3 text-slate-200 text-base sm:text-lg">
              Choose a year to view all sermons from that time.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <CurveWave />
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-4 pb-28 space-y-6">
        {/* Back to Sermons */}
        <div className="flex items-center justify-between">
          <Link
            href="/sermons"
            className="text-sm text-blue-600 dark:text-blue-300 hover:underline"
          >
            ← Back to Sermons
          </Link>

          <span className="text-xs text-slate-500">
            {years.length} years
          </span>
        </div>

        {years.length === 0 ? (
          <div className="text-center py-24 text-slate-500 text-sm">
            No archived sermons yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {years.map((y) => (
              <Link
                key={y}
                href={`/sermons?year=${y}`}
                className="group rounded-2xl border p-6 text-center
                           bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl
                           hover:border-blue-500 hover:shadow-lg transition"
              >
                <div className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  {y}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  View sermons →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
