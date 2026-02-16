import { addWeeks, addMonths, endOfMonth, startOfWeek } from "date-fns";

export function getNextOccurrence(
  eventDate?: string | null,
  recurrence?: string | null
) {
  if (!eventDate || !recurrence) return null;

  const base = new Date(eventDate);
  const now = new Date();

  if (recurrence === "WEEKLY") {
    let next = base;
    while (next < now) {
      next = addWeeks(next, 1);
    }
    return next;
  }

  if (recurrence === "MONTHLY_LAST") {
    const nextMonth = addMonths(now, 1);
    return endOfMonth(nextMonth);
  }

  // 👇 CUSTOM TEXT — we do NOT auto-calc
  return "CUSTOM";
}
