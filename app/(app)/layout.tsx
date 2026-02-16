
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { NavbarProvider } from "@/components/NavbarContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>

        <NavbarProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </NavbarProvider>

        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </ThemeProvider>
  );
}



// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import { ThemeProvider } from "@/components/ThemeProvider";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { Toaster } from "sonner";
// import { NavbarProvider } from "@/components/NavbarContext";

// export default function AppLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
//       <TooltipProvider>
//         <Navbar />
//         <main className="pt-16 min-h-screen">{children}</main>
//         <Footer />
//         <Toaster richColors position="top-right" />
//       </TooltipProvider>
//     </ThemeProvider>
//   );
// }



// import "./globals.css"; 
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import { ThemeProvider } from "@/components/ThemeProvider";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { Toaster } from "sonner";
// import "leaflet/dist/leaflet.css";

// export const metadata = {};

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body>
//         <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
//           <TooltipProvider>
//             <Navbar />
//             <main className="min-h-screen bg-background text-foreground pt-16">
//               {children}
//               {/* <Toaster richColors /> */}
//               <Toaster richColors position="top-right" />
//             </main>
//             <Footer />
//           </TooltipProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }
