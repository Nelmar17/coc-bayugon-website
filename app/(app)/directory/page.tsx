"use client";

import { useEffect, useState, useMemo } from "react";
import DirectoryMap from "@/components/DirectoryMap";
import CurveWave from "@/components/ui/CurveWave";
import { motion, type Variants } from "framer-motion";


type DirectoryItem = {
  id: number;
  congregationName: string;
  region: "north" | "south" | "other";
  location: string;
  address: string;
  mainPhoto?: string | null;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};


export default function DirectoryPage() {
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<"all" | "north" | "south" | "other">("all");
  const [activeId, setActiveId] = useState<number | null>(null);
  // const [mapOpen, setMapOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(() => {
    return items
      .filter((i) => {
        const matchRegion = region === "all" ? true : i.region === region;
        const matchSearch = i.congregationName
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchRegion && matchSearch;
      })
      .sort((a, b) =>
        a.congregationName.localeCompare(b.congregationName, undefined, {
          sensitivity: "base",
        })
      );
  }, [items, region, search]);

  const REGION_LABELS: Record<string, string> = {
    north: "North Palawan",
    south: "South Palawan",
    other: "Other Region",
  };

  useEffect(() => {
    setLoading(true);
    fetch("/api/directory")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load directory");
        return r.json();
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setItems([]);
        setLoading(false);
      });
  }, []);


  // useEffect(() => {
  //   fetch("/api/directory")
  //     .then((r) => r.json())
  //     .then(setItems);
  // }, []);

// const filtered = items
//   .filter((i) => {
//     const matchRegion = region === "all" ? true : i.region === region;
//     const matchSearch = i.congregationName
//       .toLowerCase()
//       .includes(search.toLowerCase());
//     return matchRegion && matchSearch;
//   })
//   .sort((a, b) =>
//     a.congregationName.localeCompare(b.congregationName, undefined, {
//       sensitivity: "base",
//     })
//   );


  return (

 <div className="space-y-16 bg-white dark:bg-slate-950">
      {/* ================= HERO HEADER ================= */}
      <section className=" relative h-[28vh] sm:h-[45vh] md:h-[40vh] min-h-[380px] sm:min-h-[320px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
          style={{ backgroundImage: "url('/church-directory.jpg')" }}
        />

      <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-2 sm:pt-16">
          <div className="max-w-xl sm:max-w-2xl mx-auto">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white"
            >
              Directory
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.15 }}
              className="pt-4 sm:pt-4 text-slate-200 text-base sm:text-lg leading-relaxed"
            >
              Get directions across Palawan and nearby regions.
            </motion.p>
          </div>
        </div>
          <div className="absolute bottom-0 left-0 w-full pointer-events-none">
            <CurveWave />
          </div>  
      </section>
  
  {/* ================= MAIN CONTENT ================= */}
  
    <div className="max-w-7xl mx-auto px-4 relative z-20 space-y-10 pb-20 sm:pb-28 md:pb-36">
      <h1 className="text-4xl font-bold text-left">
        Find a Congregation Near You 
      </h1>

      {/* MAP */}
        <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-2xl backdrop-blur bg-white/80 dark:bg-slate-900/60 p-5"
            >
              <DirectoryMap
                items={filtered}
                activeId={activeId}
                onSelect={setActiveId}
              /> 
         </motion.div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["all", "north", "south", "other"].map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r as any)}
              className={`px-4 py-2 rounded-full border border-blue-600 text-sm ${
                region === r ? "bg-blue-800 text-white dark:bg-blue-600" : ""
              }`}
            >
              {r === "all"
                ? "All"
                : r === "north"
                ? "North Palawan"
                : r === "south"
                ? "South Palawan"
                : "Other Region"}
            </button>
          ))}
        </div>

      {/* SEARCH */}
      <input
        placeholder="Search congregation..."
        className="w-full border rounded-xl px-4 py-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

       {/* ================= LOADING ================= */}
        {loading ? (
            <div className="flex items-center justify-center py-36">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                <span className="text-sm">Loading congregations…</span>
              </div>
            </div>
        ) : (
         <>
            {/* ================= EMPTY STATE ================= */}
            {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                      No congregations found.
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      We’ll be adding congregations soon. Please check back later.
                    </p>
                  </div>
                </div>
            )}

        {/* ================= GRID ================= */}
         {filtered.length > 0 && (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate={filtered.length > 0 ? "visible" : "hidden"}
              className="grid md:grid-cols-3 pt-8 pb-28 gap-6"
            >
            {filtered.map((item) => (
            <motion.a
              layout
              variants={fadeUp}
              key={item.id}
              href={`/directory/${item.id}`}
              onMouseEnter={() => setActiveId(item.id)}
              onMouseLeave={() => setActiveId(null)}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
              className={`
                rounded-xl
                pb-8
                backdrop-blur
                bg-white/80
                dark:bg-slate-950
                shadow-lg
                hover:shadow-2xl
                transition-shadow
                duration-300
                ease-out
                dark:border
                dark:border-blue-800/60
                dark:hover:border-blue-600
              `}
            >

            {/* {item.mainPhoto && (
              <img
                src={item.mainPhoto}
                className="w-full h-48 object-cover rounded"
              />
            )} */}
            {item.mainPhoto && (
              <div className="relative w-full h-48 overflow-hidden rounded-t-lg ">
                <img
                  src={item.mainPhoto}
                  className="w-full h-full object-cover"
                  alt={item.congregationName}
                />
                <CurveWave className="h-20 md:h-14 lg:h-16" />
              </div>
            )}

            <h3 className="mt-6 ml-3 text-3xl px-4 font-medium text-slate-900 dark:text-slate-50">{item.congregationName}</h3>
            <p className="mt-4 ml-3 px-4 text-xl font-bold">{item.location}</p>
            <p className="mt-2 ml-3 px-4 text-lg text-slate-800 dark:text-slate-50 ">{item.address}</p>
            <p className="inline-block ml-7 mt-3 text-md text-slate-800 dark:text-slate-50 bg-blue-100 dark:bg-slate-800 px-3 py-0.5 rounded-lg">
              {REGION_LABELS[item.region] ?? "Unknown Region"}
            </p>
            
                {/* <p className="mt-2 text-md"> Preacher: <b>{item.preacherName}</b></p>               */}
                {/* <p className="text-md">Contact: {item.contactNumber}</p>
                <p className="text-md">{item.email}</p>              */}
             </motion.a>
              ))}
            </motion.div>
          )}
          </>
        )}
      </div>
    </div>
  );
}









// async function getDirectory() {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_BASE_URL}/api/directory`,
//     { cache: "no-store" }
//   );
//   return res.json();
// }

// export default async function DirectoryPage() {
//   const items = await getDirectory();

//   const north = items.filter((i: any) => i.region === "north");
//   const south = items.filter((i: any) => i.region === "south");
//   const other = items.filter((i: any) => i.region === "other");

//   function Section({
//     title,
//     list,
//   }: {
//     title: string;
//     list: any[];
//   }) {
//     if (list.length === 0) return null;

//     return (
//       <section className="space-y-4">
//         <h2 className="text-2xl font-bold">{title}</h2>

//         <div className="grid md:grid-cols-3 gap-6">
//           {list.map((item) => (
//             <a
//               key={item.id}
//               href={`/directory/${item.id}`}
//               className="bg-white p-4 rounded-xl shadow hover:shadow-md transition block"
//             >
//               {item.mainPhoto && (
//                 <img
//                   src={item.mainPhoto}
//                   alt={item.congregationName}
//                   className="w-full h-40 object-cover rounded-lg"
//                 />
//               )}

//               <h3 className="mt-3 font-semibold text-lg">
//                 {item.congregationName}
//               </h3>

//               <p className="text-sm text-slate-600">{item.location}</p>
//               <p className="text-sm text-slate-500">{item.address}</p>

//               <p className="mt-2 text-xs">
//                 Preacher: <b>{item.preacherName}</b>
//               </p>
//               <p className="text-xs">Contact: {item.contactNumber}</p>
//               <p className="text-xs">{item.email}</p>
//             </a>
//           ))}
//         </div>
//       </section>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
//       <h1 className="text-3xl font-bold text-center">
//         Congregations Directory
//       </h1>

//       <Section title="North Palawan" list={north} />
//       <Section title="South Palawan" list={south} />
//       <Section title="Other Locations" list={other} />
//     </div>
//   );
// }




// "use client";

// import { useEffect, useState } from "react";

// export default function DirectoryPage() {
//   const [items, setItems] = useState<any[]>([]);
//   const [region, setRegion] = useState<"all" | "north" | "south" | "other">("all");
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     fetch("/api/directory")
//       .then((r) => r.json())
//       .then(setItems);
//   }, []);

//   const filtered = items.filter((i) => {
//     const matchRegion =
//       region === "all" ? true : i.region === region;

//     const matchSearch =
//       i.congregationName.toLowerCase().includes(search.toLowerCase());

//     return matchRegion && matchSearch;
//   });

//   return (

    
//     <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

      
//       <h1 className="text-3xl font-bold text-center">
//         Church of Christ - Palawan Directory
//       </h1>

//     <div className="rounded-md overflow-hidden shadow">
//       <iframe
//         src="https://www.google.com/maps/d/embed?mid=15SYxj7oBzlvoDveNdejpOKlhhHcDaAc&ehbc=2E312F"
//         width="100%"
//         height="450"
//         loading="lazy"
//       />
//     </div>


//       {/* FILTERS */}
//       <div className="flex flex-wrap gap-2 justify-center">
//         {["all", "north", "south", "other"].map((r) => (
//           <button
//             key={r}
//             onClick={() => setRegion(r as any)}
//             className={`px-4 py-2 rounded-full border text-sm ${
//               region === r ? "bg-black text-white" : ""
//             }`}
//           >
//             {r === "all"
//               ? "All"
//               : r === "north"
//               ? "North Palawan"
//               : r === "south"
//               ? "South Palawan"
//               : "Other"}
//           </button>
//         ))}
//       </div>

//       {/* SEARCH */}
//       <input
//         placeholder="Search congregation..."
//         className="w-full border rounded px-4 py-2"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       {/* CARDS */}
//       <div className="grid md:grid-cols-3 gap-6">
//         {filtered.map((item) => (
//           <a
//             key={item.id}
//             href={`/directory/${item.id}`}
//             className="bg-white p-4 rounded-xl shadow hover:shadow-md"
//           >
//             {item.mainPhoto && (
//               <img
//                 src={item.mainPhoto}
//                 className="w-full h-40 object-cover rounded"
//               />
//             )}
//             <h3 className="mt-3 text-2xl font-bold">{item.congregationName}</h3>
//             <p className="text-lg">{item.location}</p>
//             {/* <p className="text-md text-slate-500">{item.address}</p> */}
//             <p className="mt-2 text-md">
//                Preacher: <b>{item.preacherName}</b>
//             </p>
//             <p className="text-md">Contact: {item.contactNumber}</p>
//             <p className="text-md">{item.email}</p>
//           </a>
//         ))}
//       </div>
//     </div>
//   );
// }






// "use client";

// import { useEffect, useState } from "react";

// export default function DirectoryPage() {
//   const [items, setItems] = useState<any[]>([]);
//   const [region, setRegion] = useState<"all" | "north" | "south" | "other">("all");
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     fetch("/api/directory")
//       .then((r) => r.json())
//       .then(setItems);
//   }, []);

//   const filtered = items.filter((i) => {
//     const matchRegion =
//       region === "all" ? true : i.region === region;

//     const matchSearch =
//       i.congregationName.toLowerCase().includes(search.toLowerCase());

//     return matchRegion && matchSearch;
//   });

//   return (

    
//     <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

      
//       <h1 className="text-3xl font-bold text-center">
//         Church of Christ - Palawan Directory
//       </h1>

//     <div className="rounded-md overflow-hidden shadow">
//       <iframe
//         src="https://www.google.com/maps/d/embed?mid=15SYxj7oBzlvoDveNdejpOKlhhHcDaAc&ehbc=2E312F"
//         width="100%"
//         height="450"
//         loading="lazy"
//       />
//     </div>


//       {/* FILTERS */}
//       <div className="flex flex-wrap gap-2 justify-center">
//         {["all", "north", "south", "other"].map((r) => (
//           <button
//             key={r}
//             onClick={() => setRegion(r as any)}
//             className={`px-4 py-2 rounded-full border text-sm ${
//               region === r ? "bg-black text-white" : ""
//             }`}
//           >
//             {r === "all"
//               ? "All"
//               : r === "north"
//               ? "North Palawan"
//               : r === "south"
//               ? "South Palawan"
//               : "Other"}
//           </button>
//         ))}
//       </div>

//       {/* SEARCH */}
//       <input
//         placeholder="Search congregation..."
//         className="w-full border rounded px-4 py-2"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       {/* CARDS */}
//       <div className="grid md:grid-cols-3 gap-6">
//         {filtered.map((item) => (
//           <a
//             key={item.id}
//             href={`/directory/${item.id}`}
//             className="bg-white p-4 rounded-xl shadow hover:shadow-md"
//           >
//             {item.mainPhoto && (
//               <img
//                 src={item.mainPhoto}
//                 className="w-full h-40 object-cover rounded"
//               />
//             )}
//             <h3 className="mt-3 text-2xl font-bold">{item.congregationName}</h3>
//             <p className="text-lg">{item.location}</p>
//             <p className="text-md text-slate-500">{item.address}</p>
//             <p className="mt-2 text-xs">
//                Preacher: <b>{item.preacherName}</b>
//             </p>
//             <p className="text-sm">Contact: {item.contactNumber}</p>
//             <p className="text-sm">{item.email}</p>
//           </a>
//         ))}
//       </div>
//     </div>
//   );
// }



// async function getDirectory() {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_BASE_URL}/api/directory`,
//     { cache: "no-store" }
//   );
//   return res.json();
// }

// export default async function DirectoryPage() {
//   const items = await getDirectory();

//   const north = items.filter((i: any) => i.region === "north");
//   const south = items.filter((i: any) => i.region === "south");
//   const other = items.filter((i: any) => i.region === "other");

//   function Section({
//     title,
//     list,
//   }: {
//     title: string;
//     list: any[];
//   }) {
//     if (list.length === 0) return null;

//     return (
//       <section className="space-y-4">
//         <h2 className="text-2xl font-bold">{title}</h2>

//         <div className="grid md:grid-cols-3 gap-6">
//           {list.map((item) => (
//             <a
//               key={item.id}
//               href={`/directory/${item.id}`}
//               className="bg-white p-4 rounded-xl shadow hover:shadow-md transition block"
//             >
//               {item.mainPhoto && (
//                 <img
//                   src={item.mainPhoto}
//                   alt={item.congregationName}
//                   className="w-full h-40 object-cover rounded-lg"
//                 />
//               )}

//               <h3 className="mt-3 font-semibold text-lg">
//                 {item.congregationName}
//               </h3>

//               <p className="text-sm text-slate-600">{item.location}</p>
//               <p className="text-sm text-slate-500">{item.address}</p>

//               <p className="mt-2 text-xs">
//                 Preacher: <b>{item.preacherName}</b>
//               </p>
//               <p className="text-xs">Contact: {item.contactNumber}</p>
//               <p className="text-xs">{item.email}</p>
//             </a>
//           ))}
//         </div>
//       </section>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
//       <h1 className="text-3xl font-bold text-center">
//         Congregations Directory
//       </h1>

//       <Section title="North Palawan" list={north} />
//       <Section title="South Palawan" list={south} />
//       <Section title="Other Locations" list={other} />
//     </div>
//   );
// }
