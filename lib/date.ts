export function normalizeDate(dateStr: string) {
  // dateStr expected "YYYY-MM-DD"
  const d = new Date(dateStr + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) return null;
  return d;
}
