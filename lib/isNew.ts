export function isNewItem(
  date: string | Date,
  days = 7
) {
  const now = Date.now();
  const itemTime = new Date(date).getTime();
  const diffInDays = (now - itemTime) / (1000 * 60 * 60 * 24);

  return diffInDays <= days;
}
