"use client";

import { useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  A11y,
  Keyboard,
} from "swiper/modules";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Counter from "yet-another-react-lightbox/plugins/counter";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "yet-another-react-lightbox/styles.css";

type Props = {
  images: string[];
  className?: string;
};

export default function GalleryViewer({ images, className }: Props) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = useMemo(
    () =>
      (images ?? [])
        .filter(Boolean)
        .map((src) => ({ src })),
    [images]
  );

  if (!slides.length) {
    return (
      <div className="rounded-2xl border bg-white/70 dark:bg-slate-900/50 p-6 text-sm text-slate-500">
        No gallery images available.
      </div>
    );
  }

  return (
    <div className={className}>
      {/* ===== WRAPPER FOR EDGE FADE ===== */}
      <div className="relative">
        {/* LEFT FADE */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20
                        bg-gradient-to-r from-white dark:from-slate-950" />

        {/* RIGHT FADE */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20
                        bg-gradient-to-l from-white dark:from-slate-950" />

        {/* ===== SWIPER ===== */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay, A11y, Keyboard]}
          className="gallery-swiper"
          centeredSlides
          slidesPerView={1.2}
          spaceBetween={24}
          loop={slides.length > 3}
          navigation
          pagination={{ clickable: true }}
          keyboard={{ enabled: true }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.2 },
          }}
        >
          {slides.map((s, i) => (
            <SwiperSlide key={s.src}>
              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
                className="relative block w-full overflow-hidden rounded-xl"
              >
                <img
                    src={s.src}
                    alt={`Gallery image ${i + 1}`}
                    loading="lazy"
                    className="
                      gallery-img
                      w-full
                      h-[220px] sm:h-[260px] md:h-[300px]
                      object-cover
                      select-none
                    "
                  />

                {/* hint */}
                <div className="absolute bottom-3 right-3 rounded-full
                                bg-black/60 text-white text-xs px-3 py-1 backdrop-blur">
                  Tap to zoom
                </div>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ===== LIGHTBOX ===== */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
        plugins={[Zoom, Fullscreen, Counter]}
        on={{ view: ({ index }) => setIndex(index) }}
        carousel={{ finite: slides.length <= 1 }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 1.6,
        }}
      />
    </div>
  );
}


// "use client";

// import { useMemo, useState } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination, Autoplay, A11y, Keyboard } from "swiper/modules";

// import Lightbox from "yet-another-react-lightbox";
// import Zoom from "yet-another-react-lightbox/plugins/zoom";
// import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
// import Counter from "yet-another-react-lightbox/plugins/counter";

// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

// import "yet-another-react-lightbox/styles.css";

// type Props = {
//   images: string[];
//   className?: string;
// };

// export default function GalleryViewer({ images, className }: Props) {
//   const [open, setOpen] = useState(false);
//   const [index, setIndex] = useState(0);

//   const slides = useMemo(
//     () =>
//       (images ?? [])
//         .filter(Boolean)
//         .map((src) => ({ src })),
//     [images]
//   );

//   if (!slides.length) {
//     return (
//       <div
//         className={`rounded-2xl border bg-white/70 dark:bg-slate-900/50 p-6 text-sm text-slate-500 ${className ?? ""}`}
//       >
//         No gallery images available.
//       </div>
//     );
//   }

//   return (
//     <div className={className}>
//       {/* Slider container */}
//       <div className="rounded-2xl overflow-hidden border bg-white/70 dark:bg-slate-900/50">
//         <Swiper
//           modules={[Navigation, Pagination, Autoplay, A11y, Keyboard]}
//           navigation
//           pagination={{ clickable: true }}
//           keyboard={{ enabled: true }}
//           autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
//           loop={slides.length > 1}
//           spaceBetween={0}
//           className="w-full"
//         >
//           {slides.map((s, i) => (
//             <SwiperSlide key={s.src}>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setIndex(i);
//                   setOpen(true);
//                 }}
//                 className="relative w-full"
//                 aria-label="Open image"
//               >
//                 <img
//                   src={s.src}
//                   alt={`Gallery image ${i + 1}`}
//                   className="
//                     w-full
//                     h-[240px] sm:h-[340px] md:h-[420px]
//                     object-cover
//                     select-none
//                   "
//                   loading="lazy"
//                 />

//                 {/* Small hint overlay */}
//                 <div className="absolute bottom-3 right-3 rounded-full bg-black/55 text-white text-xs px-3 py-1 backdrop-blur">
//                   Tap to zoom
//                 </div>
//               </button>
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </div>

//       {/* Lightbox */}
//       <Lightbox
//         open={open}
//         close={() => setOpen(false)}
//         slides={slides}
//         index={index}
//         plugins={[Zoom, Fullscreen, Counter]}
//         on={{
//           view: ({ index }) => setIndex(index),
//         }}
//         carousel={{
//           finite: slides.length <= 1,
//         }}
//         zoom={{
//           maxZoomPixelRatio: 3,
//           zoomInMultiplier: 1.6,
//           doubleTapDelay: 300,
//           doubleClickDelay: 300,
//         }}
//       />
//     </div>
//   );
// }
