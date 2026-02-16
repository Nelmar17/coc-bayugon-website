"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Youtube,
  ChevronUp,
  ArrowUpRight,
  ChevronsRight,
} from "lucide-react";

/* ===== SIMPLE & SAFE ANIMATION VARIANTS ===== */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer
      className="
      relative overflow-hidden
      bg-gradient-to-b 
      from-slate-200 via-slate-100 to-slate-200
      dark:from-slate-950 dark:via-slate-950 dark:to-slate-900
      text-slate-800 dark:text-slate-300
    "
    >
      {/* TOP GRADIENT LINE */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-600/40 to-transparent" />

      {/* GLOW */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-blue-500/10 dark:bg-blue-600/10 blur-2xl rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-24">

        {/* ================= VERSE ================= */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20 md:mb-24"
        >
          <p className="text-xs tracking-[0.35em] uppercase mb-6 text-blue-700 dark:text-blue-400">
            Rooted in Faith
          </p>

          <h2 className="text-3xl md:text-4xl font-heading tracking-tight leading-tight max-w-4xl mx-auto bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-300 dark:to-indigo-400 bg-clip-text text-transparent">
            “Let all that you do be done with love.”
          </h2>

          <p className="mt-5 text-md text-slate-700 dark:text-slate-200">
            — 1 Corinthians 16:14 (KJV)
          </p>
        </motion.div>

        {/* ================= GLASS PANEL ================= */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-14 backdrop-blur-lg bg-white/10
              dark:bg-white/5 border border-slate-500/30
              dark:border-white/10 rounded-3xl p-12 shadow-[0_0_30px_rgba(0,0,0,0.12)] 
                dark:shadow-none"
          >
          {/* ABOUT */}
          <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.995 }}
          className="transition"
        >
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-300 dark:ring-slate-700 shadow-md">
                  <Image
                    src="/logo.png"
                    alt="Church Logo"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Church of Christ
                </h4>
              </div>

              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-400">
                A congregation devoted to New Testament Christianity —
                proclaiming truth, strengthening faith, and serving God
                with unity and love.
              </p>

              <Link
                href="/about"
                className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 hover:opacity-80 text-sm transition"
              >
                Discover More <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* EXPLORE */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.995 }}
            className="transition"
          >

            <h4 className="font-semibold mb-5 text-slate-900 dark:text-white">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "About Us", href: "/about" },
                { label: "Bible Lessons", href: "/bible-studies" },
                { label: "Sermons", href: "/sermons" },
                { label: "Events", href: "/events" },
                { label: "Directory", href: "/directory" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-blue-700 dark:hover:text-blue-400 transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CONTACT */}
          <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.995 }}
          className="transition"
        >
            <h4 className="font-semibold mb-5 text-slate-900 dark:text-white">
              Contact
            </h4>

            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 text-blue-700 dark:text-blue-400" />
                Sitio Bayugon, Tinitian, Roxas, Palawan, Philippines
              </li>

              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                +63 931 963 4596
              </li>

              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                churchofchristbayugon@gmail.com
              </li>
            </ul>

            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-blue-800 dark:text-blue-400 text-sm font-semibold border-blue-700 dark:border-blue-400 hover:bg-blue-400/20 dark:hover:bg-blue-950/40 transition"
              >
                Send Us a Message <ChevronsRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </motion.div>

          {/* SOCIAL */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.995 }}
            className="transition"
          >

            <h4 className="font-semibold mb-5 text-slate-900 dark:text-white">
              Connect
            </h4>

            <div className="flex gap-4 mb-6">
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="https://www.facebook.com/profile.php?id=61584576835431"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-300/50 dark:bg-white/5 border hover:border-blue-600 dark:hover:border-blue-500  border-slate-400/40 dark:border-white/10 transition"
              >
                <Facebook className="w-4 h-4" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.1 }}
                href="https://www.youtube.com/@ChurchOfChrist-Bayugon"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-300/50 dark:bg-white/5 border hover:border-red-600 dark:hover:border-red-500  border-slate-400/40 dark:border-white/10 transition"
              >
                <Youtube className="w-4 h-4" />
              </motion.a>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-500">
              Worship with us every Sunday and Wednesday.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-slate-500/30 dark:border-white/10 bg-slate-300/50 dark:bg-white/5 backdrop-blur-lg"
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>
            © {new Date().getFullYear()} Church of Christ. All Rights Reserved.
          </p>

          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-blue-700 dark:hover:text-blue-400 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-700 dark:hover:text-blue-400 transition">
              Terms
            </Link>
          </div>

          <p className="text-slate-600 dark:text-slate-500">
            Designed & Developed by{" "}
            <a
              href="https://nelmarbuncag.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 dark:text-blue-400 hover:opacity-80 transition"
            >
              Nelmar S. Buncag
            </a>
          </p>
        </div>
      </motion.div>
    </footer>
  );
}













// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { motion } from "framer-motion";

// import {
//   MapPin,
//   Phone,
//   Mail,
//   Facebook,
//   Youtube,
//   ArrowUpRight,
//   ChevronsRight,
// } from "lucide-react";

// /* ================= CINEMATIC MOTION ================= */

// const fadeLuxury = {
//   hidden: { opacity: 0, y: 40, scale: 0.98 },
//   show: { opacity: 1, y: 0, scale: 1 },
// };

// const staggerLuxury = {
//   hidden: {},
//   show: {
//     transition: {
//       staggerChildren: 0.18,
//     },
//   },
// };

// export default function Footer() {
//   const [showTop, setShowTop] = useState(false);

//   useEffect(() => {
//     const onScroll = () => setShowTop(window.scrollY > 400);
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   return (
//     <footer className="relative overflow-hidden text-slate-200">

//       {/* ================= CINEMATIC BACKGROUND ================= */}
//       <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-[#0f172a] to-black" />

//       {/* Floating Cathedral Glow */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 2 }}
//         className="absolute inset-0 -z-10 pointer-events-none"
//       >
//         <motion.div
//           animate={{ y: [0, -40, 0] }}
//           transition={{
//             duration: 12,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//           className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/10 blur-3xl rounded-full"
//         />
//       </motion.div>

//       {/* Subtle top line */}
//       <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

//       <div className="relative max-w-7xl mx-auto px-6 py-28">

//         {/* ================= VERSE ================= */}
//         <motion.div
//           variants={fadeLuxury}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true }}
//           transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
//           className="text-center mb-24"
//         >
//           <p className="text-xs tracking-[0.4em] uppercase mb-6 text-blue-400">
//             Rooted in Faith
//           </p>

//           <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight max-w-4xl mx-auto bg-gradient-to-r from-white via-blue-300 to-indigo-300 bg-clip-text text-transparent">
//             “Let all that you do be done with love.”
//           </h2>

//           <p className="mt-6 text-sm text-slate-400">
//             — 1 Corinthians 16:14 (KJV)
//           </p>
//         </motion.div>

//         {/* ================= GLASS PANEL ================= */}
//         <motion.div
//           variants={staggerLuxury}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true }}
//           className="grid md:grid-cols-4 gap-14 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-14 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
//         >

//           {/* ABOUT */}
//           <motion.div
//             variants={fadeLuxury}
//             transition={{ duration: 0.8 }}
//             whileHover={{ y: -4 }}
//             className="space-y-6"
//           >
//             <div className="flex items-center gap-3">
//               <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-400/40 shadow-lg">
//                 <Image
//                   src="/logo.png"
//                   alt="Church Logo"
//                   fill
//                   sizes="40px"
//                   className="object-cover"
//                 />
//               </div>
//               <h4 className="text-xl font-semibold text-white">
//                 Church of Christ
//               </h4>
//             </div>

//             <p className="text-sm text-slate-400 leading-relaxed">
//               Devoted to New Testament Christianity —
//               proclaiming truth, strengthening faith,
//               and serving God with unity and reverence.
//             </p>

//             <Link
//               href="/about"
//               className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
//             >
//               Discover More <ArrowUpRight className="w-4 h-4" />
//             </Link>
//           </motion.div>

//           {/* EXPLORE */}
//           <motion.div
//             variants={fadeLuxury}
//             transition={{ duration: 0.8 }}
//             whileHover={{ y: -4 }}
//           >
//             <h4 className="font-semibold mb-6 text-white">
//               Explore
//             </h4>

//             <ul className="space-y-4 text-sm text-slate-400">
//               {[
//                 { label: "About Us", href: "/about" },
//                 { label: "Bible Lessons", href: "/bible-studies" },
//                 { label: "Sermons", href: "/sermons" },
//                 { label: "Events", href: "/events" },
//                 { label: "Directory", href: "/directory" },
//               ].map((item) => (
//                 <li key={item.href}>
//                   <Link
//                     href={item.href}
//                     className="hover:text-blue-300 transition"
//                   >
//                     {item.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </motion.div>

//           {/* CONTACT */}
//           <motion.div
//             variants={fadeLuxury}
//             transition={{ duration: 0.8 }}
//             whileHover={{ y: -4 }}
//           >
//             <h4 className="font-semibold mb-6 text-white">
//               Contact
//             </h4>

//             <ul className="space-y-4 text-sm text-slate-400">
//               <li className="flex gap-3">
//                 <MapPin className="w-4 h-4 mt-1 text-blue-400" />
//                 Bayugon, Philippines
//               </li>
//               <li className="flex gap-3">
//                 <Phone className="w-4 h-4 text-blue-400" />
//                 +63 900 000 0000
//               </li>
//               <li className="flex gap-3">
//                 <Mail className="w-4 h-4 text-blue-400" />
//                 churchofchristbayugon@gmail.com
//               </li>
//             </ul>

//             <div className="mt-6">
//               <Link
//                 href="/contact"
//                 className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-400/40 text-blue-300 text-sm hover:bg-blue-500/10 transition"
//               >
//                 Send Us a Message <ChevronsRight className="w-4 h-4" />
//               </Link>
//             </div>
//           </motion.div>

//           {/* SOCIAL */}
//           <motion.div
//             variants={fadeLuxury}
//             transition={{ duration: 0.8 }}
//             whileHover={{ y: -4 }}
//           >
//             <h4 className="font-semibold mb-6 text-white">
//               Connect
//             </h4>

//             <div className="flex gap-4 mb-6">
//               {[Facebook, Youtube].map((Icon, i) => (
//                 <motion.a
//                   key={i}
//                   whileHover={{ scale: 1.12 }}
//                   transition={{ type: "spring", stiffness: 200 }}
//                   href="#"
//                   className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-400/40 transition"
//                 >
//                   <Icon className="w-4 h-4 text-blue-400" />
//                 </motion.a>
//               ))}
//             </div>

//             <p className="text-xs text-slate-500">
//               Worship with us every Sunday and Wednesday.
//             </p>
//           </motion.div>

//         </motion.div>
//       </div>

//       {/* ================= BOTTOM BAR ================= */}
//       <motion.div
//         variants={fadeLuxury}
//         initial="hidden"
//         whileInView="show"
//         viewport={{ once: true }}
//         transition={{ duration: 0.8 }}
//         className="border-t border-white/10 bg-black/40 backdrop-blur-xl"
//       >
//         <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
//           <p>
//             © {new Date().getFullYear()} Church of Christ. All Rights Reserved.
//           </p>

//           <div className="flex gap-6">
//             <Link href="/privacy" className="hover:text-blue-300 transition">
//               Privacy Policy
//             </Link>
//             <Link href="/terms" className="hover:text-blue-300 transition">
//               Terms
//             </Link>
//           </div>

//           <p>
//             Designed & Developed by{" "}
//             <span className="text-blue-400">Nelmar</span>
//           </p>
//         </div>
//       </motion.div>
//     </footer>
//   );
// }








