"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700" />
    );
  }

  const dark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="relative w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-105"
    >
      {/* Sun */}
      <Sun
        className={`absolute w-5 h-5 text-yellow-500 transition-all duration-300
        ${dark ? "opacity-0 scale-0 rotate-90" : "opacity-100 scale-100 rotate-0"}`}
      />

      {/* Moon */}
      <Moon
        className={`absolute w-5 h-5 text-slate-500 transition-all duration-300
        ${dark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-90"}`}
      />
    </button>
  );
}
