import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nutrition Platform",
  description: "Interactive heatmap of 212 foods × 39 nutrients. Explore nutrient density across food categories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-900 text-slate-100">
        {/* Mobile gate — hidden on md+ screens */}
        <div className="md:hidden fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <h1 className="text-2xl font-semibold text-slate-100">Open on Desktop</h1>
          <p className="text-slate-400 text-sm leading-relaxed">This platform is designed for desktop use.<br />Please visit on a larger screen.</p>
        </div>
        {/* Main app — hidden on mobile so it doesn't render behind the gate */}
        <div className="hidden md:contents">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
