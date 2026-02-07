import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 25s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        orbit: "orbit 20s linear infinite",
        "orbit-reverse": "orbit 25s linear infinite reverse",
        morph: "morph 8s ease-in-out infinite",
        "morph-delay": "morph 10s ease-in-out 3s infinite",
        aurora: "aurora 6s ease-in-out infinite",
        "aurora-delay": "aurora 8s ease-in-out 2s infinite",
        blob: "blob 7s ease-in-out infinite",
        "blob-delay": "blob 9s ease-in-out 2s infinite",
        "blob-delay-2": "blob 11s ease-in-out 4s infinite",
        drift: "drift 15s ease-in-out infinite",
        "drift-reverse": "drift 18s ease-in-out infinite reverse",
        "sparkle-1": "sparkle 3s ease-in-out infinite",
        "sparkle-2": "sparkle 3s ease-in-out 1s infinite",
        "sparkle-3": "sparkle 3s ease-in-out 2s infinite",
      },
      keyframes: {
        orbit: {
          "0%": {
            transform:
              "rotate(0deg) translateX(var(--orbit-radius, 120px)) rotate(0deg)",
          },
          "100%": {
            transform:
              "rotate(360deg) translateX(var(--orbit-radius, 120px)) rotate(-360deg)",
          },
        },
        morph: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "25%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "50%": { borderRadius: "50% 40% 60% 50% / 40% 50% 60% 50%" },
          "75%": { borderRadius: "40% 60% 50% 40% / 60% 40% 50% 60%" },
        },
        aurora: {
          "0%, 100%": {
            opacity: "0.4",
            transform: "translateY(0) scale(1) rotate(0deg)",
          },
          "33%": {
            opacity: "0.7",
            transform: "translateY(-20px) scale(1.1) rotate(5deg)",
          },
          "66%": {
            opacity: "0.5",
            transform: "translateY(10px) scale(0.95) rotate(-3deg)",
          },
        },
        blob: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(20px, -30px) scale(1.1)" },
          "50%": { transform: "translate(-15px, 20px) scale(0.9)" },
          "75%": { transform: "translate(25px, 10px) scale(1.05)" },
        },
        drift: {
          "0%": { transform: "translateX(0) translateY(0) rotate(0deg)" },
          "25%": {
            transform: "translateX(10px) translateY(-15px) rotate(90deg)",
          },
          "50%": {
            transform: "translateX(-5px) translateY(5px) rotate(180deg)",
          },
          "75%": {
            transform: "translateX(15px) translateY(10px) rotate(270deg)",
          },
          "100%": { transform: "translateX(0) translateY(0) rotate(360deg)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.3)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
