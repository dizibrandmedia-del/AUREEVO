import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Royal Emerald Palette
          dark: "#061D19",
          emerald: "#0B2B26",
          "emerald-light": "#0F3B32",
          "emerald-soft": "#1A564A",
          "emerald-card": "#092621",
          
          // Metallic Gold Palette
          gold: "#D4AF37",
          "gold-light": "#F3D278",
          "gold-dark": "#B8860B",
          "gold-subtle": "#F9F3DC",
          "gold-border": "rgba(212, 175, 55, 0.35)",

          // Core UI Tokens
          bg: "#FAF8F5",
          champagne: "#FAF8F5",
          surface: "#FFFFFF",
          text: "#0D1B18",
          muted: "#5A6B66",
          border: "#E8E2D5",
          
          // Semantic & Legacy Mappings
          blue: "#D4AF37", // Primary action maps to Gold
          "blue-dark": "#B8860B",
          violet: "#0B2B26",
          cyan: "#0F3B32",
          success: "#15803D",
          warning: "#D97706",
          error: "#B91C1C",
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #F3D278 0%, #D4AF37 50%, #B8860B 100%)",
        "gold-gradient-hover": "linear-gradient(135deg, #E5C358 0%, #C59B27 50%, #996F08 100%)",
        "emerald-gradient": "linear-gradient(180deg, #061D19 0%, #0B2B26 100%)",
        "emerald-radial": "radial-gradient(ellipse at top, #0F3B32 0%, #061D19 100%)",
        "emerald-card": "linear-gradient(135deg, #08241F 0%, #0D352D 100%)",
        "brand-gradient": "linear-gradient(135deg, #F3D278 0%, #D4AF37 50%, #B8860B 100%)",
        "brand-gradient-hover": "linear-gradient(135deg, #E5C358 0%, #C59B27 50%, #996F08 100%)",
        "dark-gradient": "linear-gradient(180deg, #061D19 0%, #0B2B26 100%)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
        cinzel: ["'Cinzel'", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(6, 29, 25, 0.05), 0 1px 2px -1px rgba(6, 29, 25, 0.05)",
        "card-hover": "0 12px 28px -5px rgba(6, 29, 25, 0.12), 0 8px 10px -6px rgba(212, 175, 55, 0.08)",
        "gold-glow": "0 0 20px -2px rgba(212, 175, 55, 0.35)",
        "gold-glow-lg": "0 0 35px -5px rgba(212, 175, 55, 0.5)",
        "emerald-glow": "0 10px 30px -5px rgba(11, 43, 38, 0.5)",
        dropdown: "0 20px 25px -5px rgba(6, 29, 25, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
