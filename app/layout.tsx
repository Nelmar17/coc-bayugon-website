import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "leaflet/dist/leaflet.css";

export const metadata = {};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



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
