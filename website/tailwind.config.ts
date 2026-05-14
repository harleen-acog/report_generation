/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          50:  "#f8f7f4",
          100: "#f0ede6",
          200: "#ddd8cc",
          300: "#c4bbaa",
          400: "#a89882",
          500: "#8f7d68",
          600: "#7a6757",
          700: "#64554a",
          800: "#534740",
          900: "#463d38",
          950: "#261f1c",
        },
        pharma: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        literary: {
          50:  "#fdf4ff",
          100: "#fae8ff",
          200: "#f5d0fe",
          300: "#f0abfc",
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
          700: "#a21caf",
          800: "#86198f",
          900: "#701a75",
          950: "#4a044e",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#463d38",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          },
        },
      },
    },
  },
  plugins: [],
};
