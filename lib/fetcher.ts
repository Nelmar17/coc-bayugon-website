// lib/fetcher.ts
import { toast } from "sonner";

export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);

  if (res.status === 401) {
    toast.error("Session expired. Logging out...");
    window.dispatchEvent(new Event("user-logout"));
    // optional: clear client state here
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return res;
}
