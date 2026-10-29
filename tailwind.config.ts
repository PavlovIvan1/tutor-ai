import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        md: "0 2px 8px -1px rgb(0 0 0 / 0.08)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("daisyui")],
  daisyui: {
    // nord + белый текст поверх primary/secondary/accent (custom токены)
    themes: [
      {
        nord: {
          "color-scheme": "light",
          primary: "#5E81AC",
          secondary: "#81A1C1",
          accent: "#88C0D0",
          neutral: "#4C566A",
          "neutral-content": "#D8DEE9",
          "base-100": "#ECEFF4",
          "base-200": "#E5E9F0",
          "base-300": "#D8DEE9",
          "base-content": "#2E3440",
          info: "#B48EAD",
          success: "#A3BE8C",
          warning: "#EBCB8B",
          error: "#BF616A",
          "primary-content": "#FFFFFF",
          "secondary-content": "#FFFFFF",
          "accent-content": "#FFFFFF",
          "base-100-content": "#2E3440",
          "info-content": "#FFFFFF",
          "success-content": "#2E3440",
          "warning-content": "#2E3440",
          "error-content": "#FFFFFF",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "0.4rem",
          "--tab-radius": "0.4rem",
        },
      },
    ],
    logs: false,
  },
};
export default config;
