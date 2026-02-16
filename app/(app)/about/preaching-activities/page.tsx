"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CurveWave from "@/components/ui/CurveWave";
import PreachingActivityItem from "@/components/preaching/PreachingActivityItem";

type Activity = any;

function PreachingActivitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // URL-based state
  const type = searchParams.get("type") ?? "all";
  const year = searchParams.get("year") ?? "all";

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setErr(null);
      try {
        // ✅ IMPORTANT: relative URL (works on mobile + prod)
        const res = await fetch("/api/preaching-activities", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data = await res.json();
        if (!alive) return;
        setActivities(data ?? []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Failed to fetch");
        setActivities([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const years = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => {
      if (a?.startDate) set.add(new Date(a.startDate).getFullYear().toString());
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchType = type === "all" || a.type === type;
      const matchYear =
        year === "all" ||
        (a.startDate &&
          new Date(a.startDate).getFullYear().toString() === year);
      return matchType && matchYear;
    });
  }, [activities, type, year]);

  function updateFilter(nextType: string, nextYear: string) {
    const params = new URLSearchParams();
    if (nextType !== "all") params.set("type", nextType);
    if (nextYear !== "all") params.set("year", nextYear);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="bg-white dark:bg-slate-950">
      {/* ================= HEADER ================= */}   
      <section className="relative isolate overflow-hidden">
        {/* BG IMAGE */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
          style={{ backgroundImage: "url('/church-contact.jpg')" }}
        />

        {/* GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

        {/* CONTENT */}
        <div className="relative z-10 flex items-center justify-center min-h-[420px] sm:min-h-[460px] px-4 pt- text-center">
          <div className="max-w-3xl">
            <p className="uppercase tracking-widest text-xs sm:text-sm text-blue-300 mb-3">
              Church Outreach & Ministry
            </p>
            <h1 className="text-4xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              Preaching Activities
            </h1>
          </div>
        </div>

        {/* CURVE */}
        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <CurveWave />
        </div>
      </section>

      {/* FILTERS */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <div
          className="flex flex-wrap gap-4 items-center rounded-2xl p-4
                     bg-white/70 dark:bg-slate-900/60
                     backdrop-blur-xl border
                     border-slate-200/60 dark:border-slate-800"
        >
          <select
            value={type}
            onChange={(e) => updateFilter(e.target.value, year)}
            className="rounded-lg border px-3 py-2 text-sm
                       bg-white/80 dark:bg-slate-950/60
                       border-slate-300 dark:border-slate-700"
          >
            <option value="all">All Types</option>
            <option value="gospel_meeting">Gospel Meeting</option>
            <option value="midweek_service">Midweek Service</option>
            <option value="sunday_service">Sunday Service</option>
            <option value="visitation">Visitation</option>
            <option value="mission_trip">Mission Trip</option>
            <option value="youth_service">Youth Service</option>
            <option value="special_event">Special Event</option>
          </select>

          <select
            value={year}
            onChange={(e) => updateFilter(type, e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm
                       bg-white/80 dark:bg-slate-950/60
                       border-slate-300 dark:border-slate-700"
          >
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500 ml-auto">
            {filteredActivities.length} results
          </span>
        </div>

        {err && (
          <div className="mt-3 text-sm text-red-500">
            {err}
          </div>
        )}
      </section>

      {/* TIMELINE */}
      <section className="max-w-5xl mx-auto px-4 pb-32 pt-6">
        {loading ? (
          <div className="text-center py-24 text-slate-500 text-sm">
            Loading activities…
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-24 text-slate-500 text-sm">
            No activities found.
          </div>
        ) : (
          <div className="relative">
            <div
              className="absolute
                left-1/2 sm:left-2
                -translate-x-1/2 sm:translate-x-0
                top-0 bottom-0
                w-px
                bg-gradient-to-b
                from-blue-500/40 via-blue-400/30 to-transparent"
            />
            <div
              className="space-y-24
                pt-2
                pl-0 sm:pl-10"
            >
              {filteredActivities.map((a) => (
                <PreachingActivityItem key={a.id} a={a} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function PreachingActivitiesPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <PreachingActivitiesContent />
    </Suspense>
  );
}
