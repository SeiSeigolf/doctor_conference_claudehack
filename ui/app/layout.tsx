import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ROUNDS.ai",
  description: "Multi-agent AI system for hospital discharge planning rounds",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-base min-h-screen text-text-primary">
        {/* Terminal-style nav bar */}
        <nav className="bg-panel border-b border-border-subtle px-6 py-0 flex items-stretch gap-0 sticky top-0 z-20 h-11">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center pr-6 mr-2 border-r border-border-subtle font-mono text-sm font-semibold text-text-primary tracking-tight hover:text-white transition-colors"
          >
            ROUNDS<span className="text-accent-text">.ai</span>
          </Link>

          {/* Nav links */}
          <Link
            href="/rounds"
            className="flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-info-text hover:text-white hover:bg-info-bg transition-colors"
          >
            Live Rounds
          </Link>
          <Link
            href="/"
            className="flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          >
            Cases
          </Link>
          <Link
            href="/summary"
            className="flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          >
            Summary
          </Link>

          {/* Right: synthetic data badge */}
          <div className="ml-auto flex items-center">
            <span className="text-2xs font-mono uppercase tracking-widest text-warning-text bg-warning-bg border border-warning-border px-2 py-1 rounded-sm">
              SYNTHETIC DATA — DEMO ONLY
            </span>
          </div>
        </nav>

        {/* Main content — full width up to 1400px */}
        <main className="max-w-[1400px] mx-auto px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
