import type { Metadata } from "next";
import { Geist, Geist_Mono, Black_Ops_One, VT323 } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Wave1 from "@/components/ui/wave-1";
import HeaderBar from "@/components/HeaderBar";
import SubNav from "@/components/SubNav";
import StartupParticleSplash from "@/components/StartupParticleSplash";
import { ResourcesProvider } from "@/lib/resources-store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const stencil = Black_Ops_One({
  variable: "--font-stencil",
  subsets: ["latin"],
  weight: ["400"],
});

const pixel = VT323({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: ["400"],
});

const chakraPetchItalic = localFont({
  src: [
    {
      path: "../../public/fonts/ChakraPetch-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
  ],
  variable: "--font-chakra",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DUST-ROSE | TERMINAL V3.0",
    template: "%s — DUST-ROSE | TERMINAL V3.0",
  },
  description: "Gritty diegetic cyberpunk control terminal for robot combat.",
  applicationName: "Dust-Rose Terminal",
  themeColor: "#2a1a12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Client-only hooks cannot be used here; create a small client navbar below
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${stencil.variable} ${pixel.variable} ${chakraPetchItalic.variable} antialiased`}>
        <ResourcesProvider>
          <div className="relative min-h-dvh w-full overflow-hidden">
            <StartupParticleSplash/>
            <Wave1 className="pointer-events-none fixed inset-0 -z-10"/>
            <div className="w-full p-4 md:p-6">
              <HeaderBar/>
              <SubNav/>
              {children}
            </div>
          </div>
        </ResourcesProvider>
        <Toaster richColors position="top-right"/>
      </body>
    </html>
  );
}
