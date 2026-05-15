import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#f8fafc",
        panel: "#ffffff",
        card: "#f1f5f9",
        border: {
          subtle: "#d7dee8",
          hover: "#a8b4c4",
        },
        text: {
          primary: "#111827",
          secondary: "#475569",
          tertiary: "#7c8798",
        },
        critical: {
          DEFAULT: "#ef4444",
          bg: "rgba(239,68,68,0.10)",
          border: "rgba(239,68,68,0.50)",
          text: "#f87171",
        },
        warning: {
          DEFAULT: "#f59e0b",
          bg: "rgba(245,158,11,0.10)",
          border: "rgba(245,158,11,0.50)",
          text: "#fbbf24",
        },
        moderate: {
          DEFAULT: "#eab308",
          bg: "rgba(234,179,8,0.10)",
          border: "rgba(234,179,8,0.50)",
          text: "#facc15",
        },
        ok: {
          DEFAULT: "#22c55e",
          bg: "rgba(34,197,94,0.10)",
          border: "rgba(34,197,94,0.50)",
          text: "#4ade80",
        },
        info: {
          DEFAULT: "#3b82f6",
          bg: "rgba(59,130,246,0.10)",
          border: "rgba(59,130,246,0.50)",
          text: "#60a5fa",
        },
        accent: {
          DEFAULT: "#2563eb",
          bg: "rgba(37,99,235,0.10)",
          border: "rgba(37,99,235,0.45)",
          text: "#1d4ed8",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px" }],
      },
    },
  },
  plugins: [],
};

export default config;
