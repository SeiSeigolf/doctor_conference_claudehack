import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ROUNDS.ai",
  description: "Multi-agent AI system for hospital discharge planning rounds",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6 sticky top-0 z-10">
          <Link href="/" className="text-base font-bold text-gray-900 tracking-tight">
            ROUNDS.ai
          </Link>
          <Link href="/rounds" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            Live Rounds
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Demo Cases
          </Link>
          <Link href="/summary" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Summary
          </Link>
          <span className="ml-auto text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded font-medium">
            SYNTHETIC DATA — Demo Only
          </span>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
