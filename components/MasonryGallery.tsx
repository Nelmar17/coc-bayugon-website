"use client";

import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Counter from "yet-another-react-lightbox/plugins/counter";

import "yet-another-react-lightbox/styles.css";

export default function MasonryGallery({
  images,
  className,
}: {
  images: string[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = useMemo(
    () => (images ?? []).filter(Boolean).map((src) => ({ src })),
    [images]
  );

  if (!slides.length) return null;

  return (
    <div className={className}>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            className="mb-4 block w-full overflow-hidden rounded-2xl border bg-white/60 dark:bg-slate-900/40 hover:shadow-lg transition"
          >
            <img
              src={s.src}
              alt={`Masonry image ${i + 1}`}
              loading="lazy"
              className="w-full h-auto object-cover"
            />
          </button>
        ))}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
        plugins={[Zoom, Fullscreen, Counter]}
        on={{ view: ({ index }) => setIndex(index) }}
        carousel={{ finite: slides.length <= 1 }}
      />
    </div>
  );
}
