"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const verses = [
  "Matthew 16:18 (KJV)",
  "Colossians 1:18 (KJV)",
  "Acts 2:42 (KJV)",
  "2 Timothy 3:16 (KJV)",
  "1 Corinthians 4:3 (KJV)",
];

export default function RotatingVerse() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % verses.length);
    }, 5000); // every 5s
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-6 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6 }}
          className="uppercase tracking-widest font-medium text-md sm:text-lg text-amber-400"
        >
          {verses[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
