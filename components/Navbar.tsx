"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoAnimated from "./LogoAnimated";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/useUser";  
import { useOnlinePing } from "@/lib/useOnlinePing";
import { isUserOnline } from "@/lib/isOnline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavbar } from "@/components/NavbarContext";
import { LIGHT_NAVBAR_MATCHERS } from "@/lib/navbarConfig";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import {
  Info,
  Users,
  ShieldCheck,
  Megaphone,
  History,
  BookOpen,
  BookMarked,
  ChevronDown,
  ChevronsUp,
  CalendarDays, 
  HandHeart,
  Menu, X,
} from "lucide-react";

export const NAV_SECTIONS = [
  {
    key: "about",
    label: "About",
    base: "/about",
    items: [
      { label: "About Overview", href: "/about", icon: Info },
      { label: "Who We Are", href: "/about/who-we-are", icon: Users },
      { label: "How We Worship", href: "/about/how-we-worship", icon: HandHeart },
      { label: "Leadership", href: "/about/leadership", icon: ShieldCheck },
      {
        label: "Preaching Activities",
        href: "/about/preaching-activities",
        icon: Megaphone,
      },
      {
        label: "History of Bayugon Church",
        href: "/about/history",
        icon: History,
      },
    ],
  },
  {
    key: "bible",
    label: "Bible Lessons",
    base: "/bible",
    match: ["/sermons", "/bible-studies"],
    items: [
      { label: "Bible Studies", href: "/bible-studies", icon: BookMarked },
      { label: "Sermons", href: "/sermons", icon: BookOpen },
    ],
  },
  {
    key: "events",
    label: "Events",
    base: "/events",
    match: ["/events", "/schedules"],
    items: [
      {
        label: "Schedule of Services",
        href: "/schedules",
        icon: CalendarDays,
      },
      { label: "Special Events", href: "/events", icon: Megaphone },
    ],
  },
];

//Desktop Dropdown HOVER OPEN DROPDOWN
function DesktopDropdown({
  section,
  active,
  pathname,
}: {
  section: any;
  active: boolean;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);

  const isRouteActive = (href: string) => pathname === href;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        // onMouseEnter={() => setTimeout(() => setOpen(true), 60)}
        // onMouseLeave={() => setTimeout(() => setOpen(false), 120)}

      >
        <DropdownMenuTrigger asChild>
          <button
            className={`transition ${
              active
                ? "text-blue-500 dark:text-blue-400 font-medium"
                : "hover:text-blue-500 dark:hover:text-blue-400"
            }`}
          >
           <DropdownNavTrigger active={active}>
            {section.label}
            <ChevronDown
              className={`
                w-4 h-4
                transition-transform duration-300 ease-out
                ${open ? "rotate-180" : "rotate-0"}
              `}
            />
          </DropdownNavTrigger>

          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="
              min-w-[220px] rounded-xl p-2 space-y-1
              bg-blue-50/60
              backdrop-blur-lg
              border border-blue-200/40
              dark:border-blue-900/20            
              shadow-xl
              dark:bg-slate-950/60
            "
           >
          {section.items.map((item: any) => {
            const itemActive = isRouteActive(item.href);
            const Icon = item.icon;

            return (
              <DropdownMenuItem
                key={item.href}
                asChild
                className={`
                   rounded-full
                    px-2 py-1.5
                    text-base
                    transition-colors
                  data-[highlighted]:bg-blue-400/60
                  dark:data-[highlighted]:bg-blue-700/40
                  ${itemActive ? "bg-blue-200 dark:bg-blue-950/60" : ""}
                `}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 ${
                    itemActive
                      ? "text-blue-700 dark:text-blue-400 font-semibold"
                      : ""
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}


/* ------------------------------------------------------- */
/*                     MAIN NAVBAR                         */
/* ------------------------------------------------------- */

export default function Navbar() {
  const mounted = useMounted();
  const user = useUser();
  const pathname = usePathname();
  
  //const isOnline = isUserOnline(user.onlineAt);
  //ONLINE PING 

  // console.log("ONLINE AT:", user?.onlineAt);
  // console.log("IS ONLINE:", isUserOnline(user?.onlineAt));
  // const isOnline = user ? isUserOnline(user.onlineAt) : false;
  useOnlinePing(!!user);

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  const router = useRouter();

  // Active link checker
  // const isActive = (href: string) =>
  // pathname === href || pathname.startsWith(href + "/");

  const { mode } = useNavbar();

  // const isLight = mode === "light";

  const isLightRoute = LIGHT_NAVBAR_MATCHERS.some(rx =>
    rx.test(pathname)
  );


  const isRouteActive = (href: string) => pathname === href;


  const isSectionActive = (
    pathname: string,
    section: { base?: string; match?: string[] }
  ) => {
    if (section.match) {
      return section.match.some(
        p => pathname === p || pathname.startsWith(p + "/")
      );
    }
    return pathname === section.base || pathname.startsWith(section.base + "/");
  };

  // Disable page scroll while mobile menu is open
  // useEffect(() => {
  //   document.body.style.overflow = open ? "hidden" : "auto";
  // }, [open]);

  useEffect(() => {
  if (window.innerWidth < 768) {
    document.body.style.overflow = open ? "hidden" : "auto";
  }
}, [open]);


  // Scroll behavior
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);

      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? y / total : 0);

      setShowTop(y > 300);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  useEffect(() => {
  window.dispatchEvent(
    new CustomEvent("navbar-mobile", { detail: open })
  );
}, [open]);

const showLightNavbar = scrolled || isLightRoute;
// const navTextClass = showLightNavbar

  // const isSectionActive = (base: string) =>
  // pathname === base || pathname.startsWith(base + "/");

  return (
    <>
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px] bg-blue-500 origin-left z-[60]"
        style={{ transform: `scaleX(${progress})` }}
      />

      {/* NAV */}
        {/* <nav className={`fixed top-0 left-0 w-full h-[72px] z-50 transition-all duration-300 ease-in-out ${
              scrolled
                ? "backdrop-blur-md font-medium bg-white/70 dark:bg-slate-900/60 shadow-lg"
                : "bg-transparent font-medium text-white backdrop-blur-0 shadow-none"
            }`}
          > */}

          {/* <nav
          className={`fixed top-0 left-0 w-full h-[72px] z-50 transition-all duration-300
            ${
              scrolled || isLight
                ? "backdrop-blur-md font-medium bg-white/70 dark:bg-slate-900/60 shadow-lg"
                : "bg-transparent font-medium text-white backdrop-blur-0 shadow-none"
            }
          `}
        >< */}

        <nav
          className={`
            fixed top-0 left-0 w-full h-[72px] z-50
            transition-all duration-300 ease-in-out
            font-regular
            ${
              showLightNavbar
                ? "bg-white/70 text-slate-900 backdrop-blur-md shadow-lg dark:bg-slate-900/60 dark:text-slate-100"
                : "bg-transparent text-white backdrop-blur-0 shadow-none"
            }
          `}
        >

        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
          {/* LOGO */}
          <LogoAnimated scrolled={scrolled} />

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
           
              {/* <NavLink href="/" active={isActive("/")}>
                    Home
              </NavLink> */}
         
              {mounted &&
                NAV_SECTIONS.map(section => {
                  const active = isSectionActive(pathname, section);
                  // const [hoverOpen, setHoverOpen] = useState(false);
                  return (
                    <DesktopDropdown
                        key={section.key}
                        section={section}
                        active={active}
                        pathname={pathname}
                      />
                    // <DropdownMenu modal={false} key={section.key}>
                    //   <DropdownMenuTrigger asChild>
                    //     <button
                    //       className={`transition ${
                    //         active
                    //           ? "text-blue-500 dark:text-blue-400 font-medium"
                    //           : "hover:text-blue-400 dark:hover:text-blue-400"
                    //       }`}
                    //     >
                    //       <DropdownNavTrigger active={active}>
                    //         {section.label}
                    //         <ChevronDown className="w-3 h-3" />
                    //       </DropdownNavTrigger>
                    //     </button>
                    //   </DropdownMenuTrigger>

                    //   <DropdownMenuContent align="start" className="min-w-[220px]">
                    //     {section.items.map(item => {
                    //       const itemActive = isRouteActive(item.href);
                    //       const Icon = item.icon;

                    //       return (
                    //               <DropdownMenuItem
                    //                 key={item.href}
                    //                 asChild
                    //                 className={`
                    //                   rounded-lg
                    //                   transition-colors
                    //                   data-[highlighted]:bg-blue-200/60
                    //                   dark:data-[highlighted]:bg-blue-700/40
                    //                   ${
                    //                     itemActive
                    //                       ? "bg-blue-200 dark:bg-blue-950/60"
                    //                       : ""
                    //                   }
                    //                 `}
                    //               >
                    //          <Link
                    //             href={item.href}
                    //             className={`flex items-center gap-2 ${
                    //               itemActive
                    //                 ? "text-blue-700 dark:text-blue-400 font-medium"
                    //                 : ""
                    //             }`}
                    //           >
                    //             <Icon className="w-4 h-4" />
                    //             {item.label}
                    //           </Link>
                    //         </DropdownMenuItem>
                    //       );
                    //     })}
                    //   </DropdownMenuContent>
                    // </DropdownMenu>
                  );
                })}

            <NavLink href="/directory" active={isRouteActive("/directory")}>
              Churches Directory
            </NavLink>


            <NavLink href="/contact" active={isRouteActive("/contact")}>
                Contact Us
            </NavLink>


            {/* SEARCH (DESKTOP ONLY) */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {/* USER MENU */}
            {/* {user && <UserMenu user={user} router={router} />} */}

          {/* AUTH / USER */}
            {/* {user ? (
                 mounted && user && <UserMenu user={user} router={router} />

                ) : ( */}
                
                {mounted && user ? (
                  <UserMenu user={user} router={router} />
                ) : (
                  <Link
                    href="/login"
                    className={`
                      px-4 py-1 rounded-full border font-medium transition-colors
                      ${
                        showLightNavbar
                          ? "border-blue-600 text-blue-800 dark:text-blue-100 hover:bg-blue-600/20"
                          : "border-blue-600 text-blue-100 hover:bg-blue-600/20"
                      }
                    `}
                  >
                    Login
                  </Link>
                )}


              {/* THEME TOGGLE*/}
              <ThemeToggle />

          </div>

        <div className="flex items-center gap-2 md:hidden">
          {/* SEARCH (MOBILE ONLY) */}
          <SearchBar />

          {/* MOBILE MENU BUTTON */}
              {/* <button
                aria-label="Toggle menu"
                onClick={() => setOpen(!open)}
                className={`
                  text-2xl transition-colors duration-300
                  p-1 rounded-md
                  hover:bg-slate-900/10 dark:hover:bg-white/10
                  ${
                    showLightNavbar
                      ? "text-slate-950 dark:text-slate-100"
                      : "text-slate-50 dark:text-white"
                  }
                `}
              >
                {open ? "✕" : "☰"}
              </button> */}
              <button
                aria-label="Toggle menu"
                onClick={() => setOpen(!open)}
                className={`
                  p-1 rounded-md transition-colors
                  hover:bg-slate-900/10 dark:hover:bg-white/10
                  ${
                    showLightNavbar
                      ? "text-slate-950 dark:text-slate-100"
                      : "text-slate-50 dark:text-white"
                  }
                `}
              >
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <MobileMenu
        open={open}
        setOpen={setOpen}
        user={user}
        router={router}
      />

      {/* <MobileMenu 
        open={open} 
        setOpen={setOpen} 
        user={user} isActive={isActive}  
        router={router} /> */}

    </nav>

      {/* BACKDROP BLUR OVERLAY */}
      {open && (
            <div
              onClick={() => setOpen(false)}
              className="
                fixed inset-0 z-40      
                backdrop-blur-xl
                md:hidden
              "
            />
          )}

        {/* Scroll To Top */}
        {showTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full
            text-white
            bg-blue-800/50 dark:bg-sky-700/80
            backdrop-blur-sm backdrop-saturate-150
            border border-blue-400/40 dark:border-blue-200/40
            hover:bg-blue-500/50 dark:hover:bg-sky-300/50
            shadow-lg transition"
          >
            <ChevronsUp className="w-4 h-10" />
          </button>
        )}
    </>
  );
}

/* ------------------------------------------------------- */
/*                    USER MENU (DESKTOP)                  */
/* ------------------------------------------------------- */

function UserMenu({
  user,
  router,
}: {
  user: any;
  router: ReturnType<typeof useRouter>;
}) {

const isOnline = isUserOnline(user?.onlineAt);

  return (
    
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-blue-700/50 dark:hover:bg-blue-800/50 transition">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={
                    user?.avatarUrl
                      ? `${user.avatarUrl}?v=${user.avatarUpdatedAt ?? ""}`
                      : "/default-avatar.png"
                  }
                  alt="User avatar"
                />
                <AvatarFallback>
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>

              {/* 🟢 ONLINE DOT */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

          <span className="text-sm hidden lg:inline">
            {user.name}
          </span>

          <ChevronDown className="w-3 h-3 hidden lg:inline" />
          </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end"
          className="space-y-1 rounded-xl bg-blue-50/60
                      p-3 backdrop-blur-lg
                      border border-blue-200/40
                    dark:border-blue-900/20              
                      shadow-md
                      dark:bg-slate-950/60">
          <DropdownMenuLabel className="px-2 py-2 text-base">Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2 h-px bg-blue-200/60 dark:bg-blue-950/40"/>

          {/* ✅ ALL LOGGED-IN MEMBERS */}
          <DropdownMenuItem
            asChild
            className="
              rounded-full
              p-0
              text-base
              transition-colors
              data-[highlighted]:bg-blue-600/40
            "
          >
            <Link
              href="/members"
              className="
                flex w-full items-center
                px-3 py-1.5
              
                text-slate-950
                dark:text-white
              "
            >
              Members List
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild             
              className="
                  rounded-full
                  p-0
                  text-base
                  transition-colors
                  data-[highlighted]:bg-blue-600/40
                "
              >
              <Link href="/me"    
                  className="
                    flex w-full items-center
                    px-3 py-1.5
                  
                    text-slate-950
                    dark:text-white"
                >My Attendance</Link>
          </DropdownMenuItem>

          {/* ✅ ALL USERS */}
          <DropdownMenuItem asChild 
                 className="
                  rounded-full
                  p-0
                  text-base
                  transition-colors
                  data-[highlighted]:bg-blue-600/40
                ">
            <Link href="/profile"                   
                 className="
                    flex w-full items-center
                    px-3 py-1.5             
                    text-slate-950
                    dark:text-white"
                    >My Profile</Link>
          </DropdownMenuItem>

        {/* ✅ ADMIN ONLY */}
 <DropdownMenuSeparator className="my-2 h-px bg-blue-200/60 dark:bg-blue-950/40"/>
        {user?.role !== "viewer" && (
          <DropdownMenuItem asChild     
              className="
                     rounded-full
                     p-0
                     text-base
                     transition-colors
                   data-[highlighted]:bg-blue-600/40">
            <Link href="/admin"   
               className="
                    flex w-full items-center
                    px-3 py-1.5             
                  text-slate-950
                  dark:text-white"
                    >Admin Dashboard</Link>
          </DropdownMenuItem>
        )}

        {/* {user.role !== "viewer" && (
          <DropdownMenuItem asChild>
            <Link href="/admin">Admin Dashboard</Link>
          </DropdownMenuItem>
        )} */}
     
        {/* <DropdownMenuItem asChild>
          <Link href="/profile">My Profile</Link>
        </DropdownMenuItem> */}

       
          {/* THEME */}
          {/* <DropdownMenuItem asChild>
            <div className="flex items-center justify-between px-2 py-0 ">
            <span className="text-base text-slate-950 dark:text-slate-300">Theme</span>
            <ThemeToggle />
          </div>
        </DropdownMenuItem>
      <DropdownMenuSeparator /> */}
      
    <DropdownMenuSeparator className="my-2 h-px bg-blue-200/60 dark:bg-blue-950/40"/>
        <DropdownMenuItem
            className="
                rounded-full
                px-3 py-1.5
                text-base
                justify-center
                text-white
                bg-blue-600
                transition-colors

                data-[highlighted]:bg-blue-800
                data-[highlighted]:text-white
              "
            onClick={() => {
              fetch("/api/logout", { method: "POST" }).then(() => {
                window.dispatchEvent(new Event("user-logout"));
                router.replace("/login");
              });
            }}
          >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------- */
/*                MOBILE MENU DRAWER                       */
/* ------------------------------------------------------- */

function MobileMenu({
  open,
  setOpen,
  user,
  router,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  user: any;
  router: ReturnType<typeof useRouter>;
}) {
  const pathname = usePathname();
  const isOnline = isUserOnline(user?.onlineAt);

  // ✅ for exit animation
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  const onTransitionEnd = () => {
    if (!open) setMounted(false);
  };

  /* ---------------- ACTIVE HELPERS ---------------- */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // const isExactActive = (href: string) => pathname === href;
  const isRouteActive = (href: string) => pathname === href;

  const isSectionActive = (section: { base?: string; match?: string[] }) => {
    if (section.match) {
      return section.match.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
      );
    }
    return pathname === section.base || pathname.startsWith(section.base + "/");
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ✅ if not mounted, don't render at all
  if (!mounted) return null;

  return (
    <div
      onTransitionEnd={onTransitionEnd}
      className={`
        md:hidden fixed left-0 right-0 top-[72px]
        z-50 max-h-[80vh] overflow-y-auto
        backdrop-blur-xl backdrop-saturate-180
        bg-white/80 dark:bg-slate-900/40
        transition-all duration-300 ease-out
        origin-top
        ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"}
      `}
    >
      {NAV_SECTIONS.map((section) => {
        const active = isSectionActive(section);
        const isOpen = openSections[section.key] ?? active;

        return (
          <div key={section.key}>
            <button
              onClick={() => toggleSection(section.key)}
              className={`relative w-full flex justify-between px-8 py-3 text-lg transition
                ${
                  active
                    ? "bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium"
                    : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-950/40"
                }`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-full transition-all
                  ${
                    active
                      ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                      : "bg-transparent"
                  }`}
              />
              {section.label}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen &&
              section.items.map((item) => {
                const itemActive = isRouteActive(item.href);
                const Icon = item.icon;

                return (
                  <MobileSubLink
                    key={item.href}
                    href={item.href}
                    active={itemActive}
                    icon={<Icon className="w-4 h-4" />}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </MobileSubLink>
                );
              })}
          </div>
        );
      })}

      <MobileLink
        href="/directory"
        active={isRouteActive("/directory")}
        onClick={() => setOpen(false)}
      >
        Churches Directory
      </MobileLink>

      <MobileLink
        href="/contact"
        active={isRouteActive("/contact")}
        onClick={() => setOpen(false)}
      >
        Contact Us
      </MobileLink>

      {!user && (
        <Link
          href="/login"
          onClick={() => setOpen(false)}
          className="
            mx-6 my-4 flex items-center justify-center py-2
            text-lg font-medium rounded-full border
            border-blue-600 text-blue-600
            hover:bg-blue-600/20 hover:text-blue-800
            dark:border-blue-500 dark:text-blue-300
            dark:hover:text-white transition-colors
          "
        >
          Login
        </Link>
      )}

      <div className="flex items-center justify-between px-8 py-2 border-t border-slate-300/40 dark:border-slate-700/40">
        <span className="text-lg text-slate-700 dark:text-slate-300">Theme</span>
        <ThemeToggle />
      </div>

      {user && (
        <>
          <div className="flex items-center gap-3 px-8 py-4 border-b border-t border-slate-300/40 dark:border-slate-700/40">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatarUrl || "/default-avatar.png"} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>

              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                {user.name}
              </p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <MobileLink 
            href="/members" 
            active={isRouteActive("/members")}
            onClick={() => setOpen(false)}
            >
            Members List
          </MobileLink>

          <MobileLink 
            href="/me" 
            active={isRouteActive("/me")}
            onClick={() => setOpen(false)}
            >
            My Attendance
          </MobileLink>

          <MobileLink 
            href="/profile" 
            active={isRouteActive("/profile")}
            onClick={() => setOpen(false)}
            >
            My Profile
          </MobileLink>

          {user?.role !== "viewer" && (
            <MobileLink 
              href="/admin" 
              active={isRouteActive("/admin")}
              onClick={() => setOpen(false)}
              >
              Admin Dashboard
            </MobileLink>
          )}
         <div className="py-6 px-6">
          <button
            className="w-full text-center text-lg font-medium py-2 rounded-md
            text-red-600 dark:text-white
            bg-blue-500/40 dark:bg-sky-400/30
            backdrop-blur-md backdrop-saturate-150
            hover:bg-blue-500/30 dark:hover:bg-sky-300/40
            transition"
            onClick={() => {
              fetch("/api/logout", { method: "POST" }).then(() => {
                window.dispatchEvent(new Event("user-logout"));
                router.replace("/login");
              });
            }}
          >
            Logout
          </button>
          </div>
        </>
      )}
    </div> 
  );
}

/* ------------------------------------------------------- */
/*                  DESKTOP NAV LINK                       */
/* ------------------------------------------------------- */

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative py-1 transition group ${
        active
         ? "text-blue-700 dark:text-blue-500 font-medium"
         : "hover:text-blue-500 dark:hover:text-blue-400"
      }`}
    >
      {children}
      <span
        className={`absolute left-0 right-0 -bottom-1 h-[2px] rounded-full 
        bg-blue-400 dark:bg-blue-400 transition-all origin-left 
        ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
      />
    </Link>
  );
}

/* ------------------------------------------------------- */
/*                  DropdownNavTrigger                      */
/* ------------------------------------------------------- */

function DropdownNavTrigger({
  children,
  active,
}: {
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <span className="relative inline-flex items-center gap-1 py-1 group">
      {children}

      {/* UNDERLINE */}
      <span
        className={`absolute left-0 right-0 -bottom-1 h-[2px] rounded-full
          bg-blue-400 transition-transform duration-300 origin-left
          ${
            active
              ? "scale-x-100"
              : "scale-x-0 group-hover:scale-x-100"
          }`}
      />
    </span>
  );
}


/* ------------------------------------------------------- */
/*               MOBILE LINK WITH ACTIVE STYLE             */
/* ------------------------------------------------------- */

function MobileLink({
  href,
  active,
  children,
  onClick,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-8 py-3 text-lg transition-all
        ${active
          ? "bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium shadow-sm"
          : "text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-950/40"
        }
      `}
    >
      {/* Active glow line */}
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-full transition-all ${
          active
            ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
            : "bg-transparent"
        }`}
      />

      <span>{children}</span>
    </Link>
  );
}

function MobileSubLink({
  href,
  active,
  children,
  onClick,
  icon,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center gap-2 px-12 py-2 text-md transition
        whitespace-nowrap
        ${
          active
            ? "text-blue-600 dark:text-blue-400 font-medium"
            : "text-slate-800 dark:text-slate-400 hover:text-blue-600"
        }`}
    >
      {/* ✅ SUB-LINK VERTICAL LINE */}
      <span
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full transition-all
          ${
            active
              ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              : "bg-transparent"
          }`}
      />

      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}

