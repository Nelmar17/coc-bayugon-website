import { ExternalLink } from "lucide-react";

export default function PublicScheduleMap({
  latitude,
  longitude,
  location,
}: {
  latitude?: number | null;
  longitude?: number | null;
  location?: string | null;
}) {
  if (!latitude || !longitude) return null;

  const mapSrc = `https://www.google.com/maps?q=${latitude},${longitude}&z=13&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden border bg-white dark:bg-slate-900">
        <iframe
          src={mapSrc}
          className="w-full h-[260px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="text-slate-600 dark:text-slate-300">
          📍 {location || "Event location"}
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
        >
          Open directions
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
