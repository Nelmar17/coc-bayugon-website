"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollAccept({
  onAccept,
}: {
  onAccept?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const atBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
      setScrolledToBottom(atBottom);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="space-y-6">
      <div
        ref={containerRef}
        className="max-h-64 overflow-y-auto border border-slate-300 dark:border-slate-700 rounded-xl p-6 text-sm text-slate-600 dark:text-slate-400"
      >
        Please scroll to the bottom to enable acceptance.
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          disabled={!scrolledToBottom}
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="h-4 w-4 accent-blue-700"
        />
        I have read and agree to the terms.
      </label>

      <button
        disabled={!checked}
        onClick={onAccept}
        className="px-6 py-3 rounded-full bg-blue-700 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-800 transition"
      >
        Accept
      </button>
    </div>
  );
}
