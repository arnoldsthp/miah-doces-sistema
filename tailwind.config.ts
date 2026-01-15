import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /*
         * Design System — Miah Doces
         * Posicionamento: Gourmet Premium
         */
        primary: "#B8325E",     // Framboesa sofisticado (marca, botões)
        secondary: "#4B1E1E",   // Chocolate amargo (apoio)
        background: "#FBF6F1",  // Off-white quente (fundo do app)
        surface: "#FFFFFF",    // Cards, modais
        text: "#2A1E1E",        // Texto principal
        muted: "#7A6A68",       // Texto secundário
        accent: "#C9A24D",      // Dourado suave (preços, destaque)

        /*
         * Compatibilidade com código antigo
         */
        miah: {
          rosa: "#B8325E",
          laranja: "#C9A24D",
          verde: "#4B1E1E",
          fundo: "#FBF6F1",
          texto: "#2A1E1E",
          despesa: "#9B1C31",
        },
      },
    },
  },
  plugins: [],
};

export default config;
