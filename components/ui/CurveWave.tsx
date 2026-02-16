"use client";

import { cn } from "@/lib/utils";

type CurveWaveProps = {
  className?: string;
};

export default function CurveWave({ className }: CurveWaveProps) {
  return (
    <svg
      className={cn(
        "absolute bottom-[-2px] left-0 w-full h-60 md:h-36 lg:h-40 pointer-events-none",
        className
      )}
      viewBox="0 -20 100 120"

      preserveAspectRatio="none"
    >
      {/* =========================
          MOBILE – flatter curve
          ========================= */}
      <g className="md:hidden">
        <path
          d="M0,54 Q60,100 100,42 L100,100 L0,100 Z"
          className="fill-blue-600 dark:fill-blue-700"
          opacity="0.2"
        />
        
        <path
          d="M0,72 Q60,100 100,42 L100,100 L0,100 Z"
          className="fill-blue-600 dark:fill-blue-700"
          opacity="0.50"
        />

        {/* RIGHT */}

        <path
          d="M0,89 Q60,100 100,22 L100,100 L0,100 Z"
          className="fill-white dark:fill-slate-950"
          opacity="0.2"
        />
        <path
          d="M0,90 Q60,100 100,42 L100,100 L0,100 Z"
          className="fill-white dark:fill-slate-900"
          opacity="0.50"
        />
       
        <path
          d="M0,90 Q60,104 100,60 L100,100 L0,100 Z"
          className="fill-white dark:fill-slate-950"
        />

      </g>

      {/* =========================
          DESKTOP – deeper curve
          ========================= */}
      <g className="hidden md:block">

        {/* LEFT */}
        <path
          d="M0,30 Q60,110 100,-20 L100,100 L0,100 Z"
          className="fill-blue-600 dark:fill-blue-800"
          opacity="0.2"
        />  
             
        <path
          d="M0,60 Q60,100 100,10 L100,100 L0,100 Z"
          className="fill-blue-600 dark:fill-blue-800"
          opacity="0.2"
        />

        {/* RIGHT */}
        <path
          d="M0,90 Q60,100 100,-20 L100,100 L0,100 Z"
          className="fill-blue-100 dark:fill-slate-950"
          opacity="0.2"
        />
        <path
          d="M0,100 Q60,100 100,10 L100,100 L0,100 Z"
          className="fill-blue-100 dark:fill-slate-900"
          opacity="0.45"
        />
          <path
            d="M0,90 Q60,104 100,40 L100,110 L0,110 Z"
            className="fill-white dark:fill-slate-950"
          />
      </g>
    </svg>
  );
}
















// "use client";

// import { cn } from "@/lib/utils";

// type CurveWaveProps = {
//   className?: string;
//   colorClass?: string;
// };

// export default function CurveWave({
//   className,
//   colorClass = "text-slate-50 dark:text-slate-950",
// }: CurveWaveProps) {
//   return (

//       <svg
//         className="absolute bottom-[-1px] left-0 w-full h-40 md:h-32 lg:h-36 pointer-events-none"
//         viewBox="0 0 100 100"
//         preserveAspectRatio="none"
//       >

//         {/* <path
//           d="M0,97 L100,0 L100,100 L0,100 Z"
//           className="fill-slate-50 dark:fill-slate-900"
//           opacity="0.10"
//         /> */}

//         {/* Layer 1 – pinaka likod (pinakamababa opacity) */}
//         <path
//           d="M0,97 L100,20 L100,100 L0,100 Z"
//           className="fill-slate-50 dark:fill-slate-950"
//           opacity="0.25"
//         />

//         {/* Layer 2 – gitna */}
//         <path
//           d="M0,98 L100,40 L100,100 L0,100 Z"
//           className="fill-slate-50 dark:fill-slate-950"
//           opacity="0.5"
//         />

//         {/* Layer 3 – pinaka harap (solid) */}
//         <path
//           d="M0,99 L100,60 L100,100 L0,100 Z"
//           className="fill-white dark:fill-slate-950"
//           opacity="1"
//         />
//       </svg>
//     // <svg
//     //   className={cn("block w-full", className)}
//     //   viewBox="0 0 1440 322"
//     //   preserveAspectRatio="none"
//     //   aria-hidden="true"
//     // >
//     //   {/* BACK */}
//     //   <path
//     //     fill="currentColor"
//     //     className={colorClass}
//     //     opacity="0.25"
//     //     d="
//     //       M0,220
//     //       C240,260 480,275 720,275
//     //       C960,275 1200,245 1440,10
//     //       L1440,322 L0,322 Z
//     //     "
//     //   />

//     //   {/* MIDDLE */}
//     //   <path
//     //     fill="currentColor"
//     //     className={colorClass}
//     //     opacity="0.5"
//     //     d="
//     //       M0,255
//     //       C240,285 480,300 720,295
//     //       C960,290 1200,260 1440,70
//     //       L1440,322 L0,322 Z
//     //     "
//     //   />

//     //   {/* FRONT */}
//     //   <path
//     //     fill="currentColor"
//     //     className={colorClass}
//     //     d="
//     //       M0,280
//     //       C240,300 480,310 720,305
//     //       C960,300 1200,280 1440,130
//     //       L1440,322 L0,322 Z
//     //     "
//     //   />
//     // </svg>
//   );
// }
