import { format } from "date-fns";

export function BaptismBadge({ date }: { date: string }) {
  const d = new Date(date);
  const now = new Date();

  let years = now.getFullYear() - d.getFullYear();

  const hasAnniversaryPassed =
    now.getMonth() > d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() >= d.getDate());

  if (!hasAnniversaryPassed) years--;

  years = Math.max(0, years);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
      bg-blue-600/90 text-white text-sm font-medium shadow">
      🎉{" "}
      {years > 0
        ? `Baptized ${years} year${years !== 1 ? "s" : ""}`
        : "Newly Baptized"}
      <span className="opacity-80">
        (since {format(d, "MMM d, yyyy")})
      </span>
    </div>
  );
}
