import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blueframe: { DEFAULT: '#1E3A8A', light: '#3B82F6', dark: '#1E40AF' },
        sentiment: { positive: '#10B981', negative: '#E11D48', neutral: '#64748B' },
      },
      fontFamily: { sans: ['YekanBakhFaNum', 'system-ui', 'sans-serif'] },
      borderRadius: { lg: '16px', md: '12px', sm: '8px' },
      boxShadow: { soft: '0 4px 20px rgba(0,0,0,0.03)' },
    },
  },
  plugins: [],
};
export default config;
