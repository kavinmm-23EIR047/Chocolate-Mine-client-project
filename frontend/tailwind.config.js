/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        card: "var(--card)",

        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",

        "button-bg": "var(--button-bg)",
        "button-text": "var(--button-text)",
        "button-buy": "var(--button-buy)",
        "button-buy-text": "var(--button-buy-text)",

        navbar: "var(--navbar)",
        "navbar-text": "var(--navbar-text)",
        sidebar: "var(--sidebar)",

        heading: "var(--heading)",
        body: "var(--body)",
        "card-text": "var(--card-text)",
        muted: "var(--muted)",

        border: "var(--border)",

        input: "var(--input)",
        "input-border": "var(--input-border)",

        badge: "var(--badge)",
        "badge-sale": "var(--badge-sale)",
        "badge-coupon": "var(--badge-coupon)",

        success: "var(--success)",
        error: "var(--error)",
        warning: "var(--warning)",
        star: "var(--star)",

        footer: "var(--footer)",
        "footer-text": "var(--footer-text)",

        /* ===================================
           BRAND STATIC PALETTE (from logo)
        =================================== */

        /* Dark Chocolate Brown — logo text */
        choc: {
          DEFAULT: "#3D1F1A",
          light: "#5C3530",
          dark: "#280F0B",
        },

        /* Soft Cream — logo background */
        cream: {
          DEFAULT: "#FDE8E4",
          light: "#FFF4F2",
          dark: "#F5D0CA",
        },

        /* Mid-Brown — secondary text / muted */
        mocha: {
          DEFAULT: "#7A4A44",
          light: "#9E6E68",
          dark: "#5C3530",
        },
      },

      fontFamily: {
        sans: ["Inter", "Outfit", "sans-serif"],
      },

      boxShadow: {
        soft: "0 2px 15px -3px rgba(61,31,26,0.08)",
        card: "0 1px 4px 0 rgba(61,31,26,0.10)",
        lift: "0 10px 24px -4px rgba(61,31,26,0.18)",
        dark: "0 10px 30px -5px rgba(0,0,0,0.45)",
      },

      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },

      transitionDuration: {
        250: "250ms",
      },
    },
  },

  plugins: [],
};