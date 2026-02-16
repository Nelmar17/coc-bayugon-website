// lib/isOnline.ts
export function isUserOnline(onlineAt?: string | Date | null) {
  if (!onlineAt) return false;
  return Date.now() - new Date(onlineAt).getTime() < 2 * 60 * 1000;
}
