"use client";

import { useState } from "react";

export default function LightboxGallery({ images }: { images: string[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  function next() {
    setIndex((i) => (i + 1) % images.length);
  }

  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => openAt(i)}
            className="group relative"
          >
            <img
              src={img}
              className="rounded-xl shadow object-cover h-40 w-full"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
          <button
            className="absolute left-4 text-3xl text-white"
            onClick={prev}
          >
            ‹
          </button>
          <button
            className="absolute right-4 text-3xl text-white"
            onClick={next}
          >
            ›
          </button>
          <img
            src={images[index]}
            className="max-h-[80vh] max-w-[90vw] rounded-xl shadow-lg"
          />
        </div>
      )}
    </>
  );
}
