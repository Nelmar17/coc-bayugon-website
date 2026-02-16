import { format } from "date-fns";

export function isoToDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function datetimeLocalToISO(v: string) {
  return v ? new Date(v).toISOString() : "";
}

export function formatTimeRange(start?: string | null, end?: string | null) {
  if (!start) return "";
  const s = format(new Date(start), "h:mm a");
  if (!end) return s;
  const e = format(new Date(end), "h:mm a");
  return `${s} – ${e}`;
}

export function timezoneLabel(date: Date) {
  const offset = -date.getTimezoneOffset() / 60;
  return `GMT${offset >= 0 ? "+" : ""}${offset}`;
}
