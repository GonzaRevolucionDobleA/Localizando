import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0faf5",
          100: "#dcf2e7",
          200: "#bbe6d0",
          300: "#8dd4b2",
          400: "#57bb8d",
          500: "#34a370",
          600: "#2D7D5A",
          700: "#1e6947",
          800: "#1b5439",
          900: "#184530",
          950: "#0c271c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
