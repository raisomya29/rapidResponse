import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        emergency: {
          DEFAULT: "hsl(var(--emergency))",
          foreground: "hsl(var(--emergency-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "pulse-emergency": {
          "0%, 100%": { boxShadow: "0 0 30px hsl(var(--emergency) / 0.5), 0 0 60px hsl(var(--emergency) / 0.3)" },
          "50%": { boxShadow: "0 0 60px hsl(var(--emergency) / 0.9), 0 0 120px hsl(var(--emergency) / 0.5)" },
        },
        ripple: { "0%": { transform: "scale(1)", opacity: "0.8" }, "100%": { transform: "scale(2.5)", opacity: "0" } },
        "float-slow": { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        "flash-border": { "0%, 100%": { borderColor: "hsl(var(--emergency) / 0.4)" }, "50%": { borderColor: "hsl(var(--emergency) / 1)" } },
        shake: {
          "0%, 100%": { transform: "translate(0,0)" },
          "25%": { transform: "translate(-2px, 1px)" },
          "50%": { transform: "translate(2px, -1px)" },
          "75%": { transform: "translate(-1px, 2px)" },
        },
        "wave-bar": { "0%, 100%": { transform: "scaleY(0.3)" }, "50%": { transform: "scaleY(1)" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-emergency": "pulse-emergency 1.5s ease-in-out infinite",
        ripple: "ripple 2s ease-out infinite",
        "float-slow": "float-slow 4s ease-in-out infinite",
        "flash-border": "flash-border 0.8s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out infinite",
        "wave-bar": "wave-bar 0.8s ease-in-out infinite",
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
