"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CurveWave from "@/components/ui/CurveWave";
import PreachingActivityItem from "@/components/preaching/PreachingActivityItem";

type Activity = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  preacher?: string | null;
  location?: string | null;
  startDate?: string | null;
  coverImageUrl?: string | null;
};

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  all: "All",
  gospel_meeting: "Gospel Meeting",
  gospel_preaching: "Gospel Preaching",
  midweek_service: "Midweek Service",
  sunday_service: "Sunday Service",
  visitation: "Visitation",
  mission_trip: "Mission Trip",
  youth_service: "Youth Service",
  special_event: "Special Event",
  preachers_bible_class: "Preachers Bible Class",
};

const TYPE_OPTIONS = [
  "all",
  "gospel_meeting",
  "gospel_preaching",
  "midweek_service",
  "sunday_service",
  "visitation",
  "mission_trip",
  "youth_service",
  "special_event",
  "preachers_bible_class",
];

const INITIAL_VISIBLE = 12;
const LOAD_MORE_STEP = 12;

function getTypeLabel(type: string) {
  return ACTIVITY_TYPE_LABELS[type] ?? type;
}

function PreachingActivitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const type = searchParams.get("type") ?? "all";
  const year = searchParams.get("year") ?? "all";
  const q = searchParams.get("q") ?? "";

  const [searchValue, setSearchValue] = useState(q);

  useEffect(() => {
    setSearchValue(q);
  }, [q]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch("/api/preaching-activities", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data = await res.json();

        if (!alive) return;

        const sorted = Array.isArray(data)
          ? [...data].sort((a, b) => {
              const aTime = a?.startDate ? new Date(a.startDate).getTime() : 0;
              const bTime = b?.startDate ? new Date(b.startDate).getTime() : 0;
              return bTime - aTime;
            })
          : [];

        setActivities(sorted);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? "Failed to fetch activities.");
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue === q) return;
      updateFilter(type, year, searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, q, type, year]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [type, year, q]);

  const years = useMemo(() => {
    const set = new Set<string>();

    activities.forEach((a) => {
      if (!a?.startDate) return;
      const yr = new Date(a.startDate).getFullYear();
      if (!Number.isNaN(yr)) {
        set.add(String(yr));
      }
    });

    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    return activities.filter((a) => {
      const matchType = type === "all" || a.type === type;

      const activityYear = a.startDate
        ? new Date(a.startDate).getFullYear().toString()
        : "";

      const matchYear = year === "all" || activityYear === year;

      const haystack = [
        a.title,
        a.description,
        a.preacher,
        a.location,
        getTypeLabel(a.type),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchSearch = !keyword || haystack.includes(keyword);

      return matchType && matchYear && matchSearch;
    });
  }, [activities, type, year, q]);

  const visibleActivities = useMemo(() => {
    return filteredActivities.slice(0, visibleCount);
  }, [filteredActivities, visibleCount]);

  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};

    visibleActivities.forEach((a) => {
      const yr =
        a.startDate && !Number.isNaN(new Date(a.startDate).getTime())
          ? new Date(a.startDate).getFullYear().toString()
          : "No Date";

      if (!groups[yr]) groups[yr] = [];
      groups[yr].push(a);
    });

    const orderedKeys = Object.keys(groups).sort((a, b) => {
      if (a === "No Date") return 1;
      if (b === "No Date") return -1;
      return Number(b) - Number(a);
    });

    return orderedKeys.map((key) => ({
      year: key,
      items: groups[key],
    }));
  }, [visibleActivities]);

  const hasMore = visibleCount < filteredActivities.length;

  function updateFilter(nextType: string, nextYear: string, nextQ: string) {
    const params = new URLSearchParams();

    if (nextType !== "all") params.set("type", nextType);
    if (nextYear !== "all") params.set("year", nextYear);
    if (nextQ.trim()) params.set("q", nextQ.trim());

    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  }

  function clearFilters() {
    setSearchValue("");
    router.replace("?", { scroll: false });
  }

  return (
    <div className="bg-white dark:bg-slate-950">
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 blur-sm"
          style={{ backgroundImage: "url('/church-contact.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/70 to-slate-950/90" />

        <div className="relative z-10 flex items-center justify-center min-h-[360px] sm:min-h-[420px] px-4 text-center">
          <div className="max-w-4xl">
            <p className="uppercase tracking-[0.25em] text-[11px] sm:text-xs text-blue-200/90 mb-4">
              Church Outreach & Ministry
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              Preaching Activities
            </h1>

            {/* <p className="mt-4 text-sm sm:text-base text-slate-200/90 max-w-2xl mx-auto leading-relaxed">
              Explore gospel meetings, mission trips, visitations, worship
              services, and other ministry works through a clean and organized
              archive.
            </p> */}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <CurveWave />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 relative z-20">
        <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 p-4 sm:p-5 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_auto] gap-4 items-start">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search title, preacher, location, description..."
                className="w-full h-12 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[180px_auto] gap-4 w-full lg:w-auto">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => updateFilter(type, e.target.value, q)}
                  className="w-full h-12 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                >
                  <option value="all">All Years</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="h-12 px-5 rounded-2xl border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition w-full"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
              Activity Type
            </label>

            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((itemType) => {
                const active = itemType === type;

                return (
                  <button
                    key={itemType}
                    onClick={() => updateFilter(itemType, year, q)}
                    className={[
                      "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium border transition",
                      active
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                        : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400",
                    ].join(" ")}
                  >
                    {getTypeLabel(itemType)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-slate-700 dark:text-slate-200">
              <span className="font-semibold">{filteredActivities.length}</span>{" "}
              result{filteredActivities.length !== 1 ? "s" : ""}
            </div>

            {type !== "all" && (
              <div className="rounded-full bg-blue-50 dark:bg-blue-950/40 px-4 py-2 text-blue-700 dark:text-blue-300">
                Type: <span className="font-semibold">{getTypeLabel(type)}</span>
              </div>
            )}

            {year !== "all" && (
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-slate-700 dark:text-slate-200">
                Year: <span className="font-semibold">{year}</span>
              </div>
            )}

            {q && (
              <div className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-slate-700 dark:text-slate-200">
                Search: <span className="font-semibold">"{q}"</span>
              </div>
            )}
          </div>

          {err && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {err}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pt-10 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900"
              >
                <div className="h-52 bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="p-5">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-3" />
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-3" />
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
                  <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-12 text-center">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              No activities found
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Try changing the search keyword or filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-14">
            {groupedActivities.map((group) => (
              <div key={group.year}>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {group.year}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/40 via-slate-300 dark:via-slate-700 to-transparent" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {group.items.map((a) => (
                    <PreachingActivityItem key={a.id} a={a} />
                  ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_STEP)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 dark:border-slate-700 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default function PreachingActivitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-500">
          Loading page...
        </div>
      }
    >
      <PreachingActivitiesContent />
    </Suspense>
  );
}