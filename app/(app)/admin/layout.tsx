"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import CurveWave from "@/components/ui/CurveWave";
import { CategoryProvider } from "@/lib/category-context";
import { Toaster } from "sonner";


import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  CalendarCheck2,
  ChartAreaIcon,
  Clock,
  FileText,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  LogOut,
  Trash,
  BookMarked,
  Tags,
  Map,
  Info,
  
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { useUser } from "@/lib/useUser";

/* ---------------------------------------------
 * ADMIN LINKS (WITH DROPDOWNS)
 * -------------------------------------------- */
const adminLinks = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["admin", "editor", "content_manager"],
  },
  { name: "Messages", 
    href: "/admin/messages", 
    icon: Mail,
    roles: ["admin", "editor", "content_manager"],
  },

  {
    name: "About",
    icon: Info,
    roles: ["admin", "editor"],
    children: [
      {
        name: "Who We Are",
        href: "/admin/about/who-we-are",
        icon: FileText,
      },
      {
        name: "Leadership",
        href: "/admin/about/leadership",
        icon: Users,
      },
      {
        name: "Preaching Activities",
        href: "/admin/about/preaching-activities",
        icon: BookOpen,
      },
    ],
  },

  {
    name: "Bible Lessons",
    icon: BookMarked,
    roles: ["admin", "editor"],
    children: [
      {
        name: "Bible Studies",
        href: "/admin/lessons/bible-studies",
        icon: BookMarked,
      },
      {
        name: "Categories", // ✅ NEW
        href: "/admin/categories",
        icon: Tags, // pwede ring Tag / Folder icon
      },
      {
        name: "Sermons",
        href: "/admin/lessons/sermons",
        icon: BookOpen,
      },
    ],
  },

  // {
  //   name: "Sermons",
  //   href: "/admin/sermons",
  //   icon: BookOpen,
  //   roles: ["admin", "editor"],
  // },
  //   {
  //   name: "Bible Study",
  //   href: "/admin/bible-studies",
  //   icon: BookOpen,
  //   roles: ["admin", "editor"],
  // },
  {
    name: "Special Events",
    href: "/admin/events",
    icon: CalendarDays,
    roles: ["admin", "editor"],
  },
  {
    name: "Schedules of Services",
    href: "/admin/schedules",
    icon: CalendarClock,
    roles: ["admin", "editor"],
  },

   {
    name: "Weekly Schedule",
    href: "/admin/weekly-schedule",
    icon:  Clock,
    roles: ["admin", "editor"],
  },
  {
    name: "Churches Directory",
    href: "/admin/directory",
    icon: Map,
    roles: ["admin", "editor"],
  },

  // {
  //   name: "Articles",
  //   href: "/admin/articles",
  //   icon: FileText,
  //   roles: ["admin", "editor"],
  // },
  {
    name: "Members",
    href: "/admin/members",
    icon: Users,
    roles: ["admin", "editor"],
  },

  // 🔽 ATTENDANCE DROPDOWN
  {
    name: "Attendance",
    icon: CalendarCheck2,
    roles: ["admin", "editor"],
    children: [
      {
        name: "Take Attendance",
        href: "/admin/attendance",
        icon: CalendarCheck,
      },
      {
        name: "History",
        href: "/admin/attendance/history",
        icon: FileText,
      },
      {
        name: "Charts",
        href: "/admin/attendance/charts",
        icon: ChartAreaIcon,
      },
    ],
  },

  // 🔽 USERS DROPDOWN
  {
    name: "Users",
    icon: Users,
    roles: ["admin"],
    children: [
      {
        name: "Active Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        name: "Trash",
        href: "/admin/users/trash",
        icon: Trash,
      },
      {
        name: "Audit Logs",
        href: "/admin/audit",
        icon: FileText,
      },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  const user = useUser();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/messages/unread-count");
      const data = await res.json();
      setUnreadMessages(data.count ?? 0);
    }

    load();
    const i = setInterval(load, 15000); // every 15s
    return () => clearInterval(i);
  }, []);

  
  useEffect(() => {
  fetch("/api/admin/stats")
    .then((r) => r.json())
    .then((data) => setUnreadMessages(data.messages ?? 0));
}, []);


  useEffect(() => {
  const onScroll = () => {
    setScrolled(window.scrollY > 80);
  };


  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);


const [aboutOpen, setAboutOpen] = useState(
  pathname.startsWith("/admin/about")
);

const [lessonsOpen, setLessonsOpen] = useState(
  pathname.startsWith("/admin/lessons") ||
  pathname.startsWith("/admin/categories")
);


const [attendanceOpen, setAttendanceOpen] = useState(
  pathname.startsWith("/admin/attendance")
);

const [usersOpen, setUsersOpen] = useState(
  pathname.startsWith("/admin/users") ||
  pathname.startsWith("/admin/audit")
);

  const breadcrumbs = pathname
  .replace("/admin", "")
  .split("/")
  .filter(Boolean);



  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (

    <CategoryProvider>
       {/* ✅ SONNER TOASTER — ADMIN SCOPE */}
        <Toaster
            richColors
            position="top-right"
            className="z-[9999]"
          />
    <div className="flex min-h-screen">
      {/* MOBILE SIDEBAR OPEN BUTTON */}
      {!mobileOpen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-slate-50 fixed top-20 left-1 z-30
           rounded-xl bg-blue-800/40 dark:bg-blue-700/60
            backdrop-blur-md backdrop-saturate-150
            
            hover:bg-blue-500/50 dark:hover:bg-sky-300/50
          "
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed md:static z-30 bg-white pt-16 dark:bg-neutral-950 border-r border-slate-200 dark:border-slate-800 h-full flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* TOP */}
       <div className="flex items-center justify-between p-3 border-b border-t border-slate-200 dark:border-slate-800">

          {!collapsed && <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100"> Admin</h1>}

          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <ChevronsLeft />
          </Button>
        </div>

        {/* NAV */}
        <nav className="space-y-1 p-2 flex-1">
          {adminLinks
            .filter((l) => l.roles.includes(user?.role))
            .map((link) => {
              const Icon = link.icon;

   /* ---------- DROPDOWN LINKS ---------- */
               if (link.children) {
                  const isUsers = link.name === "Users";
                  const isAttendance = link.name === "Attendance";
                  const isAbout = link.name === "About";
                  const isLessons = link.name === "Bible Lessons";

                  const isActive =
                    isUsers
                      ? pathname.startsWith("/admin/users") ||
                        pathname.startsWith("/admin/audit")
                      : isAttendance
                      ? pathname.startsWith("/admin/attendance")
                      : isAbout
                      ? pathname.startsWith("/admin/about") 
                      : isLessons
                      ? pathname.startsWith("/admin/lessons") ||
                        pathname.startsWith("/admin/categories")
                      : false;

                  const open =
                    isUsers
                      ? usersOpen
                      : isAttendance
                      ? attendanceOpen
                      : isAbout
                      ? aboutOpen
                      : isLessons
                      ? lessonsOpen
                      : false;

                  const setOpen =
                    isUsers
                      ? setUsersOpen
                      : isAttendance
                      ? setAttendanceOpen
                      : isAbout
                      ? setAboutOpen
                      : isLessons
                      ? setLessonsOpen
                      : () => {};



                return (
                  <div key={link.name} className="space-y-1">
                    <button
                      onClick={() => setOpen((v) => !v)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
                       isActive
                            ? "bg-blue-800 text-white"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"

                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">
                            {link.name}
                          </span>
                          <ChevronRight
                            className={cn(
                              "w-4 h-4 transition-transform",
                              open && "rotate-90"
                            )}
                          />
                        </>
                      )}
                    </button>

                    {!collapsed && open && (
                      <div className="ml-9 space-y-1">
                        {link.children.map((child) => {
                          const ChildIcon = child.icon;
                          const active = pathname === child.href;

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition",
                                active
                                  ? "bg-blue-800 text-white"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"

                              )}
                            >
                              <ChildIcon className="w-4 h-4" />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              /* ---------- NORMAL LINKS ---------- */
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");

                  /* ---------- NORMAL LINKS ---------- */
                  return (
                    <Tooltip key={link.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
                            isActive
                              ? "bg-blue-800 text-white border-l-4 border-blue-400"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          <Icon className="w-5 h-5" />

                          {!collapsed && <span>{link.name}</span>}

                          {/* ✅ UNREAD BADGE — DITO */}
                            {link.name === "Messages" && unreadMessages > 0 && !collapsed && (
                              <span className="ml-auto rounded-full bg-red-500 text-white text-xs px-2 py-0.5">
                                {unreadMessages}
                              </span>
                            )}
                        </Link>
                      </TooltipTrigger>

                      {collapsed && (
                        <TooltipContent side="right">
                          {link.name}
                          {/* optional: pwede ring ipakita count sa tooltip */}
                          {link.name === "Messages" && unreadMessages > 0 && (
                            <span className="ml-2 text-red-500 font-semibold">
                              ({unreadMessages})
                            </span>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );

            })}
        </nav>

        {/* USER FOOTER */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatarUrl || "/default-avatar.png"} />
              <AvatarFallback>
                {user?.name?.slice(0, 2)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>

            {!collapsed && user && (
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="mt-3 mb-52 w-full justify-start"
          >

            <LogOut className="w-4 h-4 mr-1" />
            {!collapsed && "Logout"}
          </Button>
        </div>

      </aside>

{/* CONTENT */}
      <main className="min-h-screen flex-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">

          {/* HEADER */}
 <div
  className={cn(
    "relative w-full overflow-hidden transition-all duration-700 pt-[72px]",

            scrolled
              ? "h-28 md:h-32"
              : "h-56 md:h-56 lg:h-72"
          )}
        >

            <img
              src="/admin-main-header.jpg"
              alt="Header"
              className="absolute inset-0 w-full h-full object-cover scale-110 animate-imageBlur"
            />

            <div
              className="absolute inset-0 opacity-80 animate-gradient"
              style={{
                background:
                  "linear-gradient(270deg,#020617,#064e3b,#0f766e,#7f1d1d,#020617)",
                backgroundSize: "600% 600%",
              }}
            />

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
              <h1
                className={cn(
                  "font-bold text-white transition-all",
                  scrolled ? "text-2xl" : "text-3xl"
                )}
              >
                Bayugon Church Of Christ  
              </h1>

              {!scrolled && (
                <div className="mt-2 text-lg text-white/80 flex gap-1 flex-wrap justify-center">
                  <span>Admin</span>
                  {breadcrumbs.map((c, i) => (
                    <span key={i}>/ {c.replace("-", " ")}</span>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ WAVE — TABLET-SAFE */}
          <div className="absolute bottom-0 left-0 w-full pointer-events-none">
            <CurveWave/>
          </div>

          {/* Subtle divider – admin safe */}
          {/* <div className="absolute bottom-0 left-0 w-full h-px bg-slate-200 dark:bg-slate-800" /> */}

       {/* <svg
        className="absolute bottom-[-1px] left-0 w-full h-40 md:h-32 lg:h-36 pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >

        
        <path
          d="M0,97 L100,65 L100,100 L0,100 Z"
          className="fill-slate-50 dark:fill-slate-950"
          opacity="0.25"
        />

       
        <path
          d="M0,98 L100,82 L100,100 L0,100 Z"
          className="fill-slate-50 dark:fill-slate-950"
          opacity="0.5"
        />

       
        <path
          d="M0,100 L100,100 L100,100 L0,100 Z"
          className="fill-slate-50 dark:fill-slate-950"
          opacity="1"
        />
      </svg> */}

          </div>
     {/* PAGE CONTENT */}
        <div className="relative p-6 bg-white dark:bg-slate-950">
          {/* 1px BLEED — kills sub-pixel seam */}
          <div
            aria-hidden
            className="
              pointer-events-none
              absolute top-0 left-0 w-full h-[1.5px]
              bg-white dark:bg-slate-950
            "
          />
          {children}
        </div>

      </main>
      {/* <main className="flex-1 pt-36 bg-slate-50 dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100">
      {children}
      </main> */}
    </div>
    </CategoryProvider>
  );
}




      //   {/* MULTI-LAYER DIAGONAL */}
      // <svg
      //   className="absolute bottom-[-1px] left-0 w-full h-40 md:h-32 lg:h-36 pointer-events-none"
      //   viewBox="0 0 100 100"
      //   preserveAspectRatio="none"
      // >
      //   {/* Layer 1 – pinaka likod (pinakamababa opacity) */}
      //   <path
      //     d="M0,97 L100,60 L100,100 L0,100 Z"
      //     className="fill-slate-50 dark:fill-slate-950"
      //     opacity="0.25"
      //   />

      //   {/* Layer 2 – gitna */}
      //   <path
      //     d="M0,98 L100,80 L100,100 L0,100 Z"
      //     className="fill-slate-50 dark:fill-slate-950"
      //     opacity="0.5"
      //   />

      //   {/* Layer 3 – pinaka harap (solid) */}
      //   <path
      //     d="M0,100 L100,100 L100,100 L0,100 Z"
      //     className="fill-slate-50 dark:fill-slate-950"
      //     opacity="1"
      //   />
      // </svg>



{/* <svg
          className="absolute bottom-[-1px] left-0 w-full h-40 md:h-32 lg:h-36 pointer-events-none"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          
          <path
            fill="currentColor"
            className="text-slate-50 dark:text-slate-950"
            opacity="0.25"
            d="M0,200L60,190C120,180,240,165,360,160C480,155,600,165,720,170C840,175,960,175,1080,160C1200,145,1320,120,1380,105L1440,90L1440,320L0,320Z"
          />

       
          <path
            fill="currentColor"
            className="text-slate-50 dark:text-slate-950"
            opacity="0.5"
            d="M0,235L60,225C120,215,240,195,360,180C480,165,600,155,720,160C840,165,960,185,1080,195C1200,205,1320,205,1380,205L1440,205L1440,320L0,320Z"
          />

         
          <path
            fill="currentColor"
            className="text-slate-50 dark:text-slate-950"
            opacity="1"
            d="M0,288L60,272C120,256,240,224,360,208C480,192,600,192,720,197.3C840,203,960,213,1080,213.3C1200,213,1320,203,1380,197.3L1440,192L1440,320L0,320Z"
          />
        </svg> */}


// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";

// import {
//   Menu,
//   X,
//   LayoutDashboard,
//   Users,
//   BookOpen,
//   CalendarDays,
//   Clock,
//   FileText,
//   ChevronLeft,
//   ChevronsLeft,
//   ChevronRight,
//   ChevronsRight,
//   Trash,
//   LogOut,
//   User as UserIcon,
// } from "lucide-react";

// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// import {
//   Avatar,
//   AvatarFallback,
//   AvatarImage,
// } from "@/components/ui/avatar";

// import { useUser } from "@/lib/useUser";

// /* ---------------------------------------------
//  * ADMIN LINKS (WITH ATTENDANCE DROPDOWN)
//  * -------------------------------------------- */
// const adminLinks = [
//   {
//     name: "Dashboard",
//     href: "/admin",
//     icon: LayoutDashboard,
//     roles: ["admin", "editor", "content_manager"],
//   },
//   {
//     name: "Directory",
//     href: "/admin/directory",
//     icon: Users,
//     roles: ["admin", "editor"],
//   },


//   {
//     name: "Sermons",
//     href: "/admin/sermons",
//     icon: BookOpen,
//     roles: ["admin", "editor"],
//   },
//   {
//     name: "Events",
//     href: "/admin/events",
//     icon: CalendarDays,
//     roles: ["admin", "editor"],
//   },
//   {
//     name: "Schedules",
//     href: "/admin/schedules",
//     icon: Clock,
//     roles: ["admin", "editor"],
//   },
//   {
//     name: "Articles",
//     href: "/admin/articles",
//     icon: FileText,
//     roles: ["admin", "editor"],
//   },
//   {
//     name: "Members",
//     href: "/admin/members",
//     icon: Users,
//     roles: ["admin", "editor"],
//   },

//   // 👇 ATTENDANCE DROPDOWN
//   {
//     name: "Attendance",
//     icon: CalendarDays,
//     roles: ["admin", "editor"],
//     children: [
//       {
//         name: "Take Attendance",
//         href: "/admin/attendance",
//         icon: CalendarDays,
//       },
//       {
//         name: "History",
//         href: "/admin/attendance/history",
//         icon: FileText,
//       },
//       {
//         name: "Charts",
//         href: "/admin/attendance/charts",
//         icon: CalendarDays,
//       },
//     ],
//   },

//   {
//   name: "Users",
//   icon: Users,
//   roles: ["admin"],
//   children: [
//     {
//       name: "All Users",
//       href: "/admin/users",
//       icon: Users,
//     },
//     {
//       name: "Trash",
//       href: "/admin/users/trash",
//       icon: Trash,
//     },
//     {
//       name: "Audit Logs",
//       href: "/admin/audit",
//       icon: FileText,
//     },
//   ],
// },

// ];

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();
//   const router = useRouter();

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [collapsed, setCollapsed] = useState(false);
//   const [navbarMobileOpen, setNavbarMobileOpen] = useState(false);



//   // 🔽 dropdown state (auto-open if inside attendance)
//   const [attendanceOpen, setAttendanceOpen] = useState(
//     pathname.startsWith("/admin/attendance")
//   );

//   const [usersOpen, setUsersOpen] = useState(
//   pathname.startsWith("/admin/users") ||
//   pathname.startsWith("/admin/audit")
// );

//   const user = useUser();

//   useEffect(() => {
//     function handler(e: any) {
//       setNavbarMobileOpen(e.detail);
//     }
//     window.addEventListener("navbar-mobile", handler);
//     return () => window.removeEventListener("navbar-mobile", handler);
//   }, []);

//   async function handleLogout() {
//     await fetch("/api/logout", { method: "POST" });
//     router.push("/login");
//   }

//   return (
//     <div className="flex min-h-screen">
//       {/* MOBILE OPEN BUTTON */}
//       {!mobileOpen && !navbarMobileOpen && (
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => setMobileOpen(true)}
//           className="
//             md:hidden fixed top-20 left-1 z-40
//             backdrop-blur-md
//             bg-white/20 dark:bg-zinc-900/40
//             border border-white/15
//             shadow-md
//           "
//         >
//           <ChevronsRight className="w-4 h-4" />
//         </Button>
//       )}

//       {/* SIDEBAR */}
//       <aside
//         className={cn(
//           "fixed md:static z-40 bg-white border-r h-full flex flex-col transition-all duration-300",
//           collapsed ? "w-16" : "w-64",
//           mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
//         )}
//       >
//         {/* TOP */}
//         <div className="flex items-center justify-between p-4 border-b">
//           {!collapsed && <h1 className="text-xl font-bold">Admin</h1>}

//           <Button
//             variant="ghost"
//             size="icon"
//             className="hidden md:flex"
//             onClick={() => setCollapsed(!collapsed)}
//           >
//             {collapsed ? <ChevronRight /> : <ChevronLeft />}
//           </Button>

//           <Button
//             variant="ghost"
//             size="icon"
//             className="md:hidden"
//             onClick={() => setMobileOpen(false)}
//           >
//             <ChevronsLeft />
//           </Button>
//         </div>

//         {/* NAV */}
//         <nav className="space-y-1 p-2 flex-1">
//           {adminLinks
//             .filter((l) => l.roles.includes(user?.role))
//             .map((link) => {
//               const Icon = link.icon;

//               // 🔽 ATTENDANCE DROPDOWN
// if (link.children) {
//   const isUsers = link.name === "Users";
//   const isAttendance = link.name === "Attendance";

//   const isActive =
//     isUsers
//       ? pathname.startsWith("/admin/users") ||
//         pathname.startsWith("/admin/audit")
//       : pathname.startsWith("/admin/attendance");

//   const open = isUsers ? usersOpen : attendanceOpen;
//   const setOpen = isUsers ? setUsersOpen : setAttendanceOpen;

//               return (
//                 <div key={link.name} className="space-y-1">
//                   <button
//                     onClick={() => setOpen((v) => !v)}
//                     className={cn(
//                       "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
//                       isActive
//                         ? "bg-slate-700 text-white"
//                         : "text-slate-700 hover:bg-slate-200"
//                     )}
//                   >
//                     <Icon className="w-5 h-5" />
//                     {!collapsed && (
//                       <>
//                         <span className="flex-1 text-left">{link.name}</span>
//                         <ChevronRight
//                           className={cn(
//                             "w-4 h-4 transition-transform",
//                             open && "rotate-90"
//                           )}
//                         />
//                       </>
//                     )}
//                   </button>

//                   {!collapsed && open && (
//                     <div className="ml-9 space-y-1">
//                       {link.children.map((child) => {
//                         const ChildIcon = child.icon;
//                         const active = pathname === child.href;

//                         return (
//                           <Link
//                             key={child.href}
//                             href={child.href}
//                             onClick={() => setMobileOpen(false)}
//                             className={cn(
//                               "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition",
//                               active
//                                 ? "bg-blue-600 text-white"
//                                 : "text-slate-600 hover:bg-slate-200"
//                             )}
//                           >
//                             <ChildIcon className="w-4 h-4" />
//                             {child.name}
//                           </Link>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             }


//               // 🔹 NORMAL LINKS
//               const isActive =
//                 pathname === link.href ||
//                 pathname.startsWith(link.href + "/");

//               return (
//                 <Tooltip key={link.href}>
//                   <TooltipTrigger asChild>
//                     <Link
//                       href={link.href}
//                       onClick={() => setMobileOpen(false)}
//                       className={cn(
//                         "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
//                         isActive
//                           ? "bg-slate-700 text-white border-l-4 border-blue-500"
//                           : "text-slate-700 hover:bg-slate-200"
//                       )}
//                     >
//                       <Icon className="w-5 h-5" />
//                       {!collapsed && <span>{link.name}</span>}
//                     </Link>
//                   </TooltipTrigger>
//                   {collapsed && (
//                     <TooltipContent side="right">
//                       {link.name}
//                     </TooltipContent>
//                   )}
//                 </Tooltip>
//               );
//             })}
//         </nav>

//         {/* USER */}
//         <div className="mt-auto p-4 border-t">
//           <div className="flex items-center gap-3">
//             <Avatar className="w-8 h-8">
//               <AvatarImage src={user?.avatarUrl || "/default-avatar.png"} />
//               <AvatarFallback>
//                 {user?.name?.slice(0, 2)?.toUpperCase() ?? "U"}
//               </AvatarFallback>
//             </Avatar>

//             {!collapsed && user && (
//               <div>
//                 <p className="font-medium">{user.name}</p>
//                 <p className="text-xs text-slate-500">{user.email}</p>
//               </div>
//             )}
//           </div>

//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={handleLogout}
//             className="mt-3 w-full justify-start"
//           >
//             <LogOut className="w-4 h-4 mr-1" />
//             {!collapsed && "Logout"}
//           </Button>
//         </div>
//       </aside>

//       {/* CONTENT */}
//       <main className="flex-1 bg-slate-50 p-6">{children}</main>
//     </div>
//   );
// }




