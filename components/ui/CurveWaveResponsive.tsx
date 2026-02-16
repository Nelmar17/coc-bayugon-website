"use client";

import { cn } from "@/lib/utils";

type CurveWaveResponsiveProps = {
  className?: string;
  direction?: "normal" | "reverse";
  baseClass?: string;
  accentClass?: string;
};

export default function CurveWaveResponsive({
  className,
  direction = "normal",
  baseClass = "fill-cyan-100 dark:fill-slate-950",
  accentClass = "fill-blue-600 dark:fill-blue-800",
}: CurveWaveResponsiveProps) {

  const isReverse = direction === "reverse";

  return (
    
    <svg
      className={cn(
        "absolute bottom-0 left-0 w-full h-40 md:h-28 lg:h-32 pointer-events-none",
        className
      )}
      viewBox="0 -30 100 120"
      preserveAspectRatio="none"
      shapeRendering="geometricPrecision"
      
      style={{
        display: "block",
        transform: isReverse ? "scaleX(-1) translateZ(0)" : "translateZ(0)",
        WebkitTransform: isReverse ? "scaleX(-1) translateZ(0)" : "translateZ(0)",
      }}
    >
     
        <defs>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

      {/* ================= MOBILE ================= */}
      <g className="md:hidden">
        <path
          d="M0 60 Q60 100 100 74 L100 100 L0 100 Z"
          className={cn(baseClass)}
        />

            <path
          d="M0 60 Q60 100 100 74"
          fill="none"
          stroke="black"
          strokeOpacity="0.18"
          strokeWidth="4"
          filter="url(#softShadow)"
        />

        <path
          d="M0 24 Q60 100 100 74 L100 100 L0 100 Z"
          className={cn(accentClass)}
          opacity="0.25"
        />

        <path
          d="M0 42 Q60 100 100 74 L100 100 L0 100 Z"
          className={cn(accentClass)}
          opacity="0.45"
        />

        <path
          d="M0 60 Q60 100 100 74 L100 100 L0 100 Z"
          className={cn(baseClass)}
        />
      </g>

      {/* ================= DESKTOP ================= */}
      <g className="hidden md:block">
        <path
          d="M0 20 Q40 120 100 26 L100 100 L0 100 Z"
          className={cn(baseClass)}
        />

        <path
          d="M0 20 Q40 120 100 26"
          fill="none"
          stroke="black"
          strokeOpacity="0.15"
          strokeWidth="4"
          className="blur-sm"
        />

        <path
          d="M0 -30 Q40 100 100 26 L100 100 L0 100 Z"
          className={cn(accentClass)}
          opacity="0.25"
        />

        <path
          d="M0 -6 Q40 110 100 26 L100 100 L0 100 Z"
          className={cn(accentClass)}
          opacity="0.40"
        />

        <path
          d="M0 20 Q40 120 100 26 L100 100 L0 100 Z"
          className={cn(baseClass)}
        />
      </g>
    </svg>
  );
}




// "use client";

// import { cn } from "@/lib/utils";

// type CurveWaveResponsiveProps = {
//   className?: string;
// };

// export default function CurveWaveResponsive({
//   className,
// }: CurveWaveResponsiveProps) {
//   return (
//     <svg
//       className={cn(
//         "absolute bottom-[-2px] left-0 w-full h-56 md:h-36 lg:h-40 pointer-events-none",
//         className
//       )}
//       viewBox="0 -30 100 120"
//       preserveAspectRatio="none"
//     >
//       {/* =========================
//           MOBILE – flatter curve
//           ========================= */}
//       <g className="md:hidden">
//         {/* BACK */}
//          <path
//           d="M0 24 Q60 100 100 74 L100 100 L0 100 Z"
//           className="fill-blue-600 dark:fill-blue-800"
//           opacity="0.40"
//         />

//         {/* MID */}
//         <path
//           d="M0 42 Q60 100 100 74 L100 100 L0 100 Z"
//           className="fill-blue-600 dark:fill-blue-700"
//           opacity="0.5"
//         />

//         {/* FRONT */}
//         <path
//           d="M0 60 Q60 100 100 74 L100 100 L0 100 Z"
//           className="fill-cyan-100 dark:fill-gray-950"
//         />
//       </g>

//       {/* =========================
//           DESKTOP – deeper curve
//           ========================= */}
//       <g className="hidden md:block">
//         {/* BACK */}
//         <path
//           d="M0 -30 Q40 100 100 26 L100 100 L0 100 Z"
//           className="fill-blue-600 dark:fill-blue-800"
//           opacity="0.40"
//         />

//         {/* MID */}
//         <path
//           d="M0 -6 Q40 110 100 26 L100 100 L0 100 Z"
//           className="fill-blue-600 dark:fill-blue-800"
//           opacity="0.35"
//         />

//         {/* FRONT */}
//         <path
//           d="M0 20 Q40 120 100 26 L100 100 L0 100 Z"
//           className="fill-cyan-100 dark:fill-gray-950"
//         />

//       </g>
//     </svg>
//   );
// }




// "use client";

// import { cn } from "@/lib/utils";

// type CurveWaveResponsiveProps = {
//   className?: string;
// };

// export default function CurveWaveResponsive({
//   className,
// }: CurveWaveResponsiveProps) {
//   return (
//     <svg
//       className={cn(
//         "absolute bottom-[-2px] left-0 w-full h-56 md:h-36 lg:h-40 pointer-events-none",
//         className
//       )}
//       viewBox="0 -20 100 120"
//       preserveAspectRatio="none"
//     >
//       {/* =========================
//           MOBILE – flatter curve
//           ========================= */}
//       <g className="md:hidden">
//         {/* BACK */}
//         <path
//           d="M0 54 Q60 100 100 42 L100 100 L0 100 Z"
//           className="fill-blue-600 dark:fill-blue-700"
//           opacity="0.2"
//         />

//         {/* MID */}
//         <path
//           d="M0 72 Q60 100 100 42 L100 100 L0 100 Z"
//           className="fill-blue-600 dark:fill-blue-700"
//           opacity="0.5"
//         />

//         {/* FRONT */}
//         <path
//           d="M0 90 Q60 104 100 60 L100 100 L0 100 Z"
//           className="fill-white dark:fill-slate-950"
//         />
//       </g>

//       {/* =========================
//           DESKTOP – deeper curve
//           ========================= */}
//       <g className="hidden md:block">
//         {/* BACK */}
//         <path
//           d="M0 30 Q60 110 100 -20 L100 100 L0 100 Z"
//           className="fill-blue-600 dark:fill-blue-800"
//           opacity="0.2"
//         />

//         {/* MID */}
//         <path
//           d="M0 60 Q60 100 100 10 L100 100 L0 100 Z"
//           className="fill-blue-600 dark:fill-blue-800"
//           opacity="0.35"
//         />

//         {/* FRONT */}
//         <path
//           d="M0 90 Q60 104 100 40 L100 100 L0 100 Z"
//           className="fill-white dark:fill-slate-950"
//         />
//       </g>
//     </svg>
//   );
// }
