import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidade Miah Doces
        miah: {
          rosa: "#FF85A2",    // Cor principal para Doces
          laranja: "#FF9F1C", // Cor para Salgados
          verde: "#2EC4B6",   // Cor para Lucro/Sucesso
          fundo: "#F8F9FA",   // Cor de fundo limpa
          texto: "#2D3436",   // Letras fáceis de ler
          despesa: "#E71D36", // Cor para contas/saídas
        },
      },
    },
  },
  plugins: [],
};
export default config;