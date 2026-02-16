"use client";

import Link from "next/link";
import Image from "next/image";

export default function LogoAnimated({ scrolled }: { scrolled: boolean }) {
  return (
    <Link
      href="/"
      className={`
        flex items-center gap-2 group 
        transition-transform duration-300
        ${scrolled ? "scale-90" : "scale-105"}
      `}
    >
  <div
    className="relative w-10 h-10 rounded-full overflow-hidden transition-all duration-300
              group-hover:scale-105 group-hover:rotate-1 shadow-md"
  >
    <Image
      src="/logo.png"
      alt="Church Logo"
      fill
      sizes="40px"
      className="object-cover"
      priority
    />
  </div>
    <span
      className={`whitespace-nowrap
        font-medium tracking-tight transition-colors duration-300
        text-lg sm:text-base md:text-lg lg:text-xl
        ${scrolled
          ? "text-red-700 dark:text-slate-50"
          : "text-yellow-500"
        }
      `}
    >
      Church of Christ
    </span>
    </Link>
  );
}
