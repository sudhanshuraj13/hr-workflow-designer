import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#13293d",
        mist: "#edf5ff",
        coral: "#f87060",
        sun: "#f9c74f",
        pine: "#21525c"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["'Segoe UI'", "sans-serif"]
      },
      boxShadow: {
        panel: "0 20px 45px rgba(19, 41, 61, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
