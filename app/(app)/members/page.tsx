"use client";

import { useEffect, useMemo, useState } from "react";
import CurveWave from "@/components/ui/CurveWave";

function calculateAge(birthday?: string | null) {
  if (!birthday) return null;
  const birth = new Date(birthday);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) age--;
  return age;
}

function isBirthdayToday(birthday?: string | null) {
  if (!birthday) return false;
  const birth = new Date(birthday);
  if (Number.isNaN(birth.getTime())) return false;

  const today = new Date();
  return (
    birth.getUTCMonth() + 1 === today.getMonth() + 1 &&
    birth.getUTCDate() === today.getDate()
  );
}

const PAGE_SIZE = 50;

export default function PublicMembersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/public/members", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  /* ================= ALWAYS RUN HOOKS ================= */

  const filtered = useMemo(() => {
    return rows
      .filter((m) => {
        const full = `${m.firstName} ${m.lastName}`.toLowerCase();
        return full.includes(search.toLowerCase());
      })
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [rows, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = useMemo(() => {
    return filtered.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );
  }, [filtered, page]);

  const grouped = useMemo(() => {
    return paginated.reduce((acc: any, m) => {
      const letter = m.lastName?.[0]?.toUpperCase() ?? "#";
      acc[letter] = acc[letter] || [];
      acc[letter].push(m);
      return acc;
    }, {});
  }, [paginated]);

  const indexMap = useMemo(() => {
    const map = new Map<number, number>();
    filtered.forEach((m, i) => map.set(m.id, i));
    return map;
  }, [filtered]);

  /* ================= SAFE UI RETURNS ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-slate-500 animate-pulse">
          Loading members…
        </p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold text-slate-700">
            No members found
          </h2>
          <p className="mt-2 text-slate-500">
            Please contact the Bayugon Church Admin to add you to the members list.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 bg-white dark:bg-slate-950">
      {/* HEADER IMAGE */}
      <section className="relative h-[28vh] sm:h-[45vh] md:h-[40vh] min-h-[380px] sm:min-h-[320px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
          style={{ backgroundImage: "url('/church-contact.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-20 sm:pt-16">
          <div className="max-w-xl sm:max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              List Of Members
            </h1>
            <p className="pt-2 sm:pt-4 text-slate-200 text-base sm:text-lg">
              <span className="block font-semibold text-white">
                Bayugon Church of Christ
              </span>
            </p>
          </div>
        </div>
       <div className="absolute bottom-0 left-0 w-full pointer-events-none">
            <CurveWave />
     </div>
   </section>

      {/* HEADER TITLE */}
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <h1 className="text-4xl font-bold">
          Find your name in the list below
        </h1>
      </div>

      {/* SEARCH */}
      <div className="max-w-4xl mx-auto px-4 pt-10">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search members..."
          className="
            w-full rounded-full border px-4 py-3 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />
        <p className="mt-2 text-sm text-slate-500">
          {filtered.length} members found
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-8 max-w-6xl mx-auto p-4 pb-28">
        {Object.keys(grouped).map((letter) => (
          <div key={letter}>
            <h2 className="sticky top-0 bg-white dark:bg-slate-950 py-2 text-xl font-bold">
              {letter}
            </h2>

            <div className="space-y-3 mt-3">
              {grouped[letter].map((m: any) => {
                const age = calculateAge(m.birthday);
                const birthdayToday = isBirthdayToday(m.birthday);

                const index =
                  (page - 1) * PAGE_SIZE +
                  ((indexMap.get(m.id) ?? 0) + 1);

                return (
                  <div
                    key={m.id}
                    className="
                      flex items-start gap-4 rounded-xl border p-4
                      bg-white dark:bg-slate-900 shadow-sm
                      hover:shadow-md transition
                    "
                  >
                    {/* AVATAR */}
                    <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold">
                      {m.firstName?.[0]}
                      {m.lastName?.[0]}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1">
                      <p className="font-semibold text-lg sm:text-lg flex items-center gap-2">
                        {m.lastName}, {m.firstName}
                        {birthdayToday && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold">
                            🎉 Birthday Today
                          </span>
                        )}
                      </p>

                      {/* <p className="font-semibold">
                        {m.lastName}, {m.firstName}
                      </p> */}

                      {/* {birthdayToday && (
                        <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold">
                          {m.firstName} Today's Birthday 🎉 Happy Birthday!
                        </div>
                      )} */}

                      {/* <p className="text-sm pt-2 text-slate-600 dark:text-slate-400">
                        {m.congregation ?? "—"} Congregation
                      </p> */}

                      {/* {age !== null && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Age: {age}
                        </p>
                      )} */}

                       <p className="text-base sm:text-md pt-1 text-slate-700 dark:text-slate-300">
                        Birthday:{" "}
                        {m.birthday
                               ? new Date(m.birthday).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "—"}
                      </p>

                      <p className="text-base sm:text-md text-slate-700 dark:text-slate-300">
                        Baptized:{" "}
                        {m.dateOfBaptism
                          ? new Date(m.dateOfBaptism).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                    {/* NUMBER */}
                    <span className="text-sm font-medium">
                      {index}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 pb-20">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 rounded border disabled:opacity-40"
        >
          Prev
        </button>

        <span className="px-4 py-2 text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded border disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}





// "use client";

// import { useEffect, useState } from "react";

// export default function PublicMembersPage() {
//       const [rows, setRows] = useState<any[]>([]);

//       useEffect(() => {
//         fetch("/api/public/members", {
//           credentials: "include",
//         })
//           .then((r) => r.json())
//           .then(setRows);
//       }, []);

//       if (rows.length === 0) {
//         return (
//           <p className="text-center mt-20 text-slate-500">
//             Please login to view members.
//           </p>
//         );
//       }

//   return (
//         <div className="space-y-3 bg-white dark:bg-slate-950">
//            {/* HEADER */}
//             <section className=" relative h-[55vh] sm:h-[45vh] md:h-[40vh] min-h-[380px] sm:min-h-[320px] -mt-16 overflow-hidden">
//               {/* Background Image */}
//               <div
//                 className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
//                 style={{
//                   backgroundImage: "url('/church-contact.jpg')",
//                 }}
//               />
//             <div className="absolute inset-0 bg-black/60" />

//            <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-20 sm:pt-16">
//               <div className="max-w-xl sm:max-w-2xl mx-auto">
//                   <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
//                     List Of Members  
//                   </h1>
//                   <p className="pt-4 sm:pt-4 text-slate-200 text-base sm:text-lg leading-relaxed">
//                     <span className="block font-semibold text-white">
//                       Bayugon Church of Christ
//                     </span>
//                   </p>
//                 </div>
//               </div>
//             </section>

//           <div className="space-y-4 max-w-6xl mx-auto p-4 pb-28">
//             {rows.map((m, index) => (
//               <div
//                 key={m.id}
//                 className="
//                   flex items-start gap-4
//                   rounded-xl border
//                   bg-white dark:bg-slate-900
//                   p-4
//                   shadow-sm
//                   hover:shadow-md
//                   transition
//                 "
//               >
//                 {/* NUMBER */}
//                 <div
//                   className="
//                     flex items-center justify-center
//                     w-10 h-10
//                     rounded-full
//                     bg-blue-600 text-white
//                     font-semibold
//                     shrink-0
//                   "
//                 >
//                   {index + 1}
//                 </div>

//                 {/* CONTENT */}
//                 <div className="flex-1 space-y-1">
//                   <p className="font-semibold text-slate-900 dark:text-slate-100">
//                     {m.lastName}, {m.firstName}
//                   </p>

//                   <p className="text-sm text-slate-500">
//                     {m.congregation ?? "—"} Congregation
//                   </p>

//                   <p className="text-sm text-slate-400">
//                     Baptized:{" "}
//                     {m.dateOfBaptism
//                       ? new Date(m.dateOfBaptism).toLocaleDateString()
//                       : "—"}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//      </div>
//   );
// }
