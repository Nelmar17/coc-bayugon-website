import CurveWave from "@/components/ui/CurveWave";
import LeadershipClient from "@/components/leadership/LeadershipClient";

async function getLeaders() {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const res = await fetch(`${base}/api/leaders`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}


// async function getLeaders() {
//   const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
//   const res = await fetch(`${base}/api/leaders`, { cache: "no-store" });
//   if (!res.ok) return [];
//   return res.json();
// }

export default async function LeadershipPage() {
  const leaders = await getLeaders();

  return (
    <div className="space-y-16 bg-white dark:bg-slate-950">
      {/* HERO */}
      <section className="relative h-[28vh] sm:h-[45vh] md:h-[40vh] min-h-[380px] sm:min-h-[320px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
          style={{ backgroundImage: "url('/church-contact.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-2 sm:pt-16">
          <div className="max-w-xl sm:max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Leadership
            </h1>
            <p className="pt-4 text-slate-200 text-base sm:text-lg">
              Faithful servants who help guide and care for the congregation.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <CurveWave />
        </div>
      </section>

      {/* CLIENT PART */}
      <LeadershipClient leaders={leaders} />
    </div>
  );
}









// import Image from "next/image";
// import CurveWave from "@/components/ui/CurveWave";

// async function getLeaders() {
//   const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
//   const res = await fetch(`${base}/api/leaders`, { cache: "no-store" });
//   if (!res.ok) return [];
//   return res.json();
// }

// export default async function LeadershipPage() {
//   const leaders = await getLeaders();

//   return (

//  <div className="space-y-16 bg-white dark:bg-slate-950 ">

//       <section className=" relative h-[28vh] sm:h-[45vh] md:h-[40vh] min-h-[380px] sm:min-h-[320px] -mt-16 overflow-hidden">
//            {/* Background Image */}
//               <div
//                className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
//                style={{
//                        backgroundImage: "url('/church-contact.jpg')",
//                      }}
//                   />
//              <div className="absolute inset-0 bg-black/60" />
//                <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-2 sm:pt-16">
//                  <div className="max-w-xl sm:max-w-2xl mx-auto">
//                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
//                         Leadership
//                      </h1>
//                     <p className="pt-4 sm:pt-4 text-slate-200 text-base sm:text-lg leading-relaxed">
//                       Faithful servants who help guide and care for the congregation.
//                    </p>
//                  </div>
//               </div>
//             <div className="absolute bottom-0 left-0 w-full pointer-events-none">
//              <CurveWave />
//             </div>   
//          </section>

//        <section className="max-w-7xl mx-auto px-4 py-2 pb-28 space-y-12">
//         {/* <header className="space-y-3">
//           <h1 className="text-4xl font-bold">Leadership</h1>
//           <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
//             Faithful servants who help guide and care for the congregation.
//           </p>
//         </header> */}
//         <section className="rounded-xl border bg-background p-6 space-y-4 max-w-6xl">
//           <h2 className="text-2xl font-semibold">Biblical Leadership</h2>

//           <p className="text-lg text-slate-800 dark:text-slate-300 leading-relaxed">
//             The church of Christ does not recognize a separate clergy class. Leadership
//             within the congregation follows the New Testament pattern, where qualified
//             men serve as elders (also called bishops or pastors) and deacons, while all
//             members serve as fellow servants of Christ{" "}
//             <span className="italic text-slate-950 dark:text-slate-100">
//               (Matthew 23:8–12; Philippians 1:1)
//             </span>.
//           </p>

//           <p className="text-lg text-slate-800 dark:text-slate-300 leading-relaxed">
//             Each congregation is self-governing under the authority of Christ, with
//             leaders appointed to shepherd, teach, and care for the spiritual well-being
//             of the members{" "}
//             <span className="italic text-slate-950 dark:text-slate-100">
//               (Acts 14:23; 1 Timothy 3:1–13; 1 Peter 5:1–4)
//             </span>.
//           </p>
//         </section>

//         <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 py-6">
//           {leaders.map((l: any) => (
//             <div
//               key={l.id}
//               className="rounded-xl border bg-background p-6 text-center space-y-4 hover:shadow-lg transition"
//             >
//               {l.imageUrl && (
//                 <div className="mx-auto w-24 h-24 rounded-full ring-1 ring-blue-400 overflow-hidden border">
//                   <Image
//                     src={l.imageUrl}
//                     alt={l.name}
//                     width={96}
//                     height={96}
//                     className="object-cover w-full h-full"
//                   />
//                 </div>
//               )}

//               <div>
//                 <h3 className="font-semibold text-lg">{l.name}</h3>
//                 <p className="text-lg text-slate-500">{l.role}</p>
//               </div>

//               {l.bio && (
//                 <p className="text-md text-slate-600 dark:text-slate-400">
//                   {l.bio}
//                 </p>
//               )}
//             </div>
//           ))}
//         </div>
//     </section>
//     </div>
//   );
// }
