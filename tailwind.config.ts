import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary colors
        "deep-indigo": "#1E1B4B",
        "electric-blue": "#2563EB",
        // Accent colors
        "neon-cyan": "#22D3EE",
        "soft-purple": "#8B5CF6",
        // Neutral colors
        "dark-gray": "#111827",
        "light-gray": "#F3F4F6",
      },
      borderRadius: {
        DEFAULT: "12px",
        card: "16px",
      },
      fontFamily: {
        sans: ["Inter", "Geist", "Satoshi", "sans-serif"],
        mono: ["monospace"],
      },
      fontSize: {
        h1: "48px",
        h2: "36px",
        h3: "28px",
        h4: "20px",
        body: "16px",
        small: "14px",
      },
      lineHeight: {
        body: "1.6",
      },
      animation: {
        'blob': 'blob 7s infinite',
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
