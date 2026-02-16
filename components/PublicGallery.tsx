"use client";

import Masonry from "react-masonry-css";
import { useState } from "react";
import Lightbox from "@/components/Lightbox";

export default function PublicGallery({ images }: { images: string[] }) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <>
      <Masonry
        breakpointCols={{ default: 3, 768: 2, 500: 1 }}
        className="flex gap-4"
        columnClassName="space-y-4"
      >
        {images.map((img) => (
          <img
            key={img}
            src={img}
            onClick={() => setPreview(img)}
            className="w-full rounded cursor-zoom-in"
          />
        ))}
      </Masonry>

      {preview && <Lightbox src={preview} onClose={() => setPreview(null)} />}
    </>
  );
}
