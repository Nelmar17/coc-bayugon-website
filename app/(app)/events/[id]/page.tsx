import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCalendar from "@/components/AddToCalendar";
import PublicScheduleMap from "@/components/PublicScheduleMap";
import { format } from "date-fns";
import { formatTimeRange, timezoneLabel } from "@/lib/datetime";
import { ChevronsLeft, ChevronsRight, ChevronRight, MapPin, Megaphone} from "lucide-react";


async function getEvent(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/events/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await getEvent(id);
  if (!event) return notFound();

  const start = new Date(event.eventDate);
  const tz = timezoneLabel(start);

  /* ✅ Correct image field */
  const heroImg = event.imageUrl || "/church-contact.jpg";

  /* ✅ Prefer coordinates (accurate), fallback to text location */
  const hasCoords =
    typeof event.latitude === "number" &&
    typeof event.longitude === "number";

  const mapsSearchUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`
    : event.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        event.location
      )}`
    : null;

  const mapsDirectionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`
    : mapsSearchUrl;

  return (
    <div className="space-y-10 bg-white dark:bg-slate-950">
      {/* HERO */}
      <section className="relative h-[55vh] min-h-[280px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url('${heroImg}')` }}
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 h-full flex items-end">
          <div className="max-w-5xl mx-auto px-4 pb-10 w-full space-y-4">
            {/* <Link
                  href="/events"
                  className="inline-flex items-center gap-1 text-md font-semibold text-blue-400 hover:text-blue-600"
                >
                  <ChevronsLeft className="w-6 h-6" />
                  Back to events
            </Link>             */}
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {event.title}
            </h1>

            <p className="text-white/80 text-md">
              {format(start, "MMMM d, yyyy")} •{" "}
              {formatTimeRange(event.eventDate, event.endDate)} ({tz})
              {/* {event.location ? ` • ${event.location}` : ""} */}
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-4 pb-24 space-y-6 -mt-10 relative z-20">

         {/* BREADCRUMBS */}
         <nav className="flex items-center gap-2 text-sm pb-8 text-slate-500 dark:text-slate-400">

            <Megaphone className="w-4 h-4" />
            <Link
            href="/events"
            className="hover:text-blue-600 transition"
            >
             Events
            </Link>
      
           <ChevronRight className="w-4 h-4" />
           <span className="font-medium text-slate-900 dark:text-white">
            {event.title}
          </span>
         </nav>

        <div className="rounded-2xl border bg-white/90 dark:bg-slate-900/70 backdrop-blur p-6 shadow">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {format(start, "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {formatTimeRange(event.eventDate, event.endDate)} ({tz})
              </p>
              {event.location && (
                <p className="inline-flex items-center gap-2 marker:text-sm text-slate-700 dark:text-slate-200">
                  <MapPin className="w-4 h-4" /> {event.location}
                </p>
              )}
            </div>

            <AddToCalendar
              title={event.title}
              start={event.eventDate}
              end={event.endDate}
              location={event.location}
              icsUrl={`/api/calendar/event-ics?eventId=${event.id}`}
            />
          </div>

          {/* ✅ ACCURATE MAP (ADMIN PIN → PUBLIC) */}
          {hasCoords && (
            <div className="mt-6">
              <PublicScheduleMap
                latitude={event.latitude}
                longitude={event.longitude}
                location={event.location}
              />
            </div>
          )}

          {/* MAP LINKS */}
          {mapsSearchUrl && (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <a
                href={mapsDirectionsUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-center rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                🗺️ Get Directions
              </a>

              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-4 py-2 text-center rounded-md border hover:bg-slate-100 dark:hover:bg-slate-950"
              >
                <MapPin className="w-4 h-4" /> Open in Google Maps
              </a>
            </div>
          )}

          {event.description && (
            <div className="mt-6 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">
              {event.description}
            </div>
          )}

          {/* LINKED ACTIVITIES */}
              {event.preachingActivities?.length > 0 && (
                <div className="pt-6 space-y-3">
                  <h2 className="text-lg font-semibold">
                    Preaching Activities
                  </h2>

                  {event.preachingActivities.map((a: any) => (
                    <div
                      key={a.id}
                      className="rounded-lg border p-4 hover:bg-blue-50 dark:hover:bg-slate-900 transition"
                    >
                      <h3 className="font-medium">{a.title}</h3>
                      <p className="text-xs text-slate-500"> 
                        {new Date(a.startDate).toLocaleString()}
                      </p>
                      <Link
                        href={`/about/preaching-activities/${a.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
                      >
                        View details <ChevronsRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}

        </div>
      </div>
    </div>
  );
}
