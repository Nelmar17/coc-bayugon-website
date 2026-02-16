"use client";

import { useEffect, useState, useRef } from "react";

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  async function loadUser() {
    try {
      const res = await fetch("/api/users/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();

    /* 🔁 EVENT-DRIVEN REFRESH */
    const refresh = () => loadUser();

    window.addEventListener("user-login", refresh);
    window.addEventListener("user-logout", refresh);
    window.addEventListener("user-updated", refresh);

    /* 🔄 POLLING (30s) */
    intervalRef.current = setInterval(loadUser, 30_000);

    /* 👁 TAB FOCUS REVALIDATION */
    const onFocus = () => loadUser();
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("user-login", refresh);
      window.removeEventListener("user-logout", refresh);
      window.removeEventListener("user-updated", refresh);
      window.removeEventListener("focus", onFocus);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return user;
}






// "use client";

// import { useEffect, useState } from "react";

// export function useUser() {
//   const [user, setUser] = useState<any>(null);

//   async function loadUser() {
//     try {
//       const res = await fetch("/api/users/me");
//       if (!res.ok) return setUser(null);
//       const data = await res.json();
//       setUser(data);
//     } catch {
//       setUser(null);
//     }
//   }

//   useEffect(() => {
//     loadUser();

//     // 🔔 LISTEN TO GLOBAL EVENTS
//     const refresh = () => loadUser();

//     window.addEventListener("user-login", refresh);
//     window.addEventListener("user-logout", refresh);
//     window.addEventListener("user-updated", refresh); // ✅ NEW

//     return () => {
//       window.removeEventListener("user-login", refresh);
//       window.removeEventListener("user-logout", refresh);
//       window.removeEventListener("user-updated", refresh);
//     };
//   }, []);

//   return user;
// }
