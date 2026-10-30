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
        background: "var(--background)",
        foreground: "var(--foreground)",
        paypal: {
          blue: "#0070BA",
          darkblue: "#003087",
          light: "#0079C1",
          gold: "#FFC439",
          gray: "#F5F7FA"
        }
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "monospace"],
      }
    },
  },
  plugins: [],
};
export default config;
