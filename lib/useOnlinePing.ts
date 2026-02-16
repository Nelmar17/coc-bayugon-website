"use client";

import { useEffect } from "react";

export function useOnlinePing(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    let stopped = false;

    async function ping() {
      if (stopped) return;

      try {
        const res = await fetch("/api/users/ping", { method: "POST" });
        if (!res.ok) return;

        // ✅ force navbar/useUser to refetch onlineAt immediately
        window.dispatchEvent(new Event("user-updated"));
      } catch {
        // silent fail
      }
    }

    // ⏱ initial ping
    ping();

    // 🔁 ping every 30s (mas responsive sa online dot)
    const interval = setInterval(ping, 30_000);

    // ✅ ping when user returns to tab / focuses window
    const onFocus = () => ping();
    const onVis = () => {
      if (document.visibilityState === "visible") ping();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stopped = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [enabled]);
}
