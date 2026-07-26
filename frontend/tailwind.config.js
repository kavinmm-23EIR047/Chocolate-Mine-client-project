/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    screens: {
      "mobile-lg": "481px",
      "tablet": "768px",
      "tablet-landscape": "1025px",
      "desktop": "1200px",
      "desktop-large": "1440px",
      "tv": "1920px",
      sm: "481px",
      md: "768px",
      lg: "1025px",
      xl: "1200px",
      "2xl": "1440px",
    },
    extend: {
      colors: {
        // Core Layout
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        foreground: "rgb(var(--foreground-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        card: "rgb(var(--card-rgb) / <alpha-value>)",
        "card-soft": "rgb(var(--card-soft-rgb) / <alpha-value>)",

        // Brand Palette
        "primary": "rgb(var(--primary-rgb) / <alpha-value>)",
        "primary-hover": "rgb(var(--primary-hover-rgb) / <alpha-value>)",
        "primary-active": "rgb(var(--primary-active-rgb) / <alpha-value>)",
        "secondary": "rgb(var(--secondary-rgb) / <alpha-value>)",
        "accent": "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-hover": "rgb(var(--accent-hover-rgb) / <alpha-value>)",

        // Navigation & Footer
        navbar: "rgb(var(--navbar-rgb) / <alpha-value>)",
        "navbar-text": "rgb(var(--navbar-text-rgb) / <alpha-value>)",
        footer: "rgb(var(--footer-rgb) / <alpha-value>)",
        "footer-text": "rgb(var(--footer-text-rgb) / <alpha-value>)",

        // Buttons
        "button-bg": "rgb(var(--button-bg-rgb) / <alpha-value>)",
        "button-text": "rgb(var(--button-text-rgb) / <alpha-value>)",
        "button-hover": "rgb(var(--button-hover-rgb) / <alpha-value>)",
        "button-alt-bg": "rgb(var(--button-alt-bg-rgb) / <alpha-value>)",
        "button-alt-text": "rgb(var(--button-alt-text-rgb) / <alpha-value>)",
        "button-alt-hover": "rgb(var(--button-alt-hover-rgb) / <alpha-value>)",

        // UI Elements
        border: "rgb(var(--border-rgb) / <alpha-value>)",
        input: "rgb(var(--input-rgb) / <alpha-value>)",
        "input-border": "rgb(var(--input-border-rgb) / <alpha-value>)",
        ring: "var(--ring)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        heading: "rgb(var(--heading-rgb) / <alpha-value>)",
        body: "rgb(var(--body-rgb) / <alpha-value>)",
        "border-muted": "rgb(var(--border-muted-rgb) / <alpha-value>)",
        error: "rgb(var(--error-rgb) / <alpha-value>)",
        sale: "rgb(var(--sale-rgb) / <alpha-value>)",
        coupon: "rgb(var(--coupon-rgb) / <alpha-value>)",
        success: "rgb(var(--success-rgb) / <alpha-value>)",
        "success-light": "rgb(var(--success-light-rgb) / <alpha-value>)",
        "success-text": "rgb(var(--success-text-rgb) / <alpha-value>)",
        sidebar: "rgb(var(--sidebar-rgb) / <alpha-value>)",
        skeleton: "rgb(var(--skeleton-rgb) / <alpha-value>)",
      },

      fontFamily: {
        sans: ["Geist Pixel", "Geist", "sans-serif"],
        heading: ["Skranji", "system-ui", "sans-serif"],
        display: ["Skranji", "system-ui", "sans-serif"],
        skranji: ["Skranji", "system-ui", "sans-serif"],
        geist: ["Geist Pixel", "Geist", "sans-serif"],
        "geist-pixel": ["Geist Pixel", "Geist", "sans-serif"],
      },

      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },

  plugins: [],
};
