"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function Lightbox({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.img
          src={src}
          className="max-h-[90vh] max-w-[90vw] object-contain"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
