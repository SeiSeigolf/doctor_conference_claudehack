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
  description: "退院調整カンファレンスのためのマルチエージェントAIシステム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-base min-h-screen text-text-primary">
        {/* Terminal-style nav bar */}
        <nav className="bg-panel border-b border-border-subtle px-6 py-0 flex items-stretch gap-0 sticky top-0 z-20 h-11">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center pr-6 mr-2 border-r border-border-subtle font-mono text-sm font-semibold text-text-primary tracking-tight hover:text-accent-text transition-colors"
          >
            ROUNDS<span className="text-accent-text">.ai</span>
          </Link>

          {/* Nav links */}
          <Link
            href="/rounds"
            className="flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-info-text hover:text-info-text hover:bg-info-bg transition-colors"
          >
            ライブ回診
          </Link>
          <Link
            href="/"
            className="flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-accent-text hover:bg-card transition-colors"
          >
            症例一覧
          </Link>
          <Link
            href="/summary"
            className="flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-accent-text hover:bg-card transition-colors"
          >
            サマリー
          </Link>

          {/* Right: synthetic data badge */}
          <div className="ml-auto flex items-center">
            <span className="text-2xs font-mono uppercase tracking-widest text-warning-text bg-warning-bg border border-warning-border px-2 py-1 rounded-sm">
              合成データ・デモ専用
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
