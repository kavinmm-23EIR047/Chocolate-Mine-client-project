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
        // Core Layout
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        card: "var(--card)",
        "card-soft": "var(--card-soft)",
        "card-text": "var(--card-text)",

        // Brand Palette
        "primary": "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        "primary-active": "var(--primary-active)",
        "secondary": "var(--secondary)",
        "accent": "var(--accent)",
        "accent-hover": "var(--accent-hover)",

        // Navigation & Footer
        navbar: "var(--navbar)",
        "navbar-text": "var(--navbar-text)",
        sidebar: "var(--sidebar)",
        footer: "var(--footer)",
        "footer-text": "var(--footer-text)",

        // Buttons
        "button-bg": "var(--button-bg)",
        "button-text": "var(--button-text)",
        "button-hover": "var(--button-hover)",
        "button-alt-bg": "var(--button-alt-bg)",
        "button-alt-text": "var(--button-alt-text)",
        "button-alt-hover": "var(--button-alt-hover)",
        "button-buy": "var(--button-buy)",
        "button-buy-text": "var(--button-buy-text)",

        // UI Elements
        border: "var(--border)",
        "border-muted": "var(--border-muted)",
        input: "var(--input)",
        "input-border": "var(--input-border)",
        ring: "var(--ring)",
        muted: "var(--muted)",
        heading: "var(--heading)",
        body: "var(--body)",

        // Semantic Colors
        "success": "var(--success)",
        "success-light": "var(--success-light)",
        "success-text": "var(--success-text)",
        
        "error": "var(--error)",
        "error-light": "var(--error-light)",
        "error-text": "var(--error-text)",
        
        "warning": "var(--warning)",
        "warning-light": "var(--warning-light)",
        "warning-text": "var(--warning-text)",
        
        "info": "var(--info)",
        "info-light": "var(--info-light)",
        "info-text": "var(--info-text)",

        // eCommerce Specific
        "sale": "var(--sale)",
        "sale-dark": "var(--sale-dark)",
        "sale-flash": "var(--sale-flash)",
        
        "coupon": "var(--coupon)",
        "coupon-mid": "var(--coupon-mid)",
        "coupon-light": "var(--coupon-light)",
        
        "urgency": "var(--urgency)",
        "urgency-dark": "var(--urgency-dark)",
        
        "star": "var(--star)",
        "skeleton": "var(--skeleton)",
        "skeleton-shine": "var(--skeleton-shine)",
      },

      fontFamily: {
        sans: ["Inter", "Manrope", "Nunito Sans", "sans-serif"],
        heading: ["Outfit", "Poppins", "Inter Tight", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },

      boxShadow: {
        soft: "0 2px 15px -3px rgba(var(--shadow-color), 0.08)",
        card: "0 1px 4px 0 rgba(var(--shadow-color), 0.10)",
        lift: "0 10px 24px -4px rgba(var(--shadow-color), 0.18)",
        premium: "0 20px 40px -10px rgba(var(--shadow-color), 0.12)",
      },

      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },

      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },

  plugins: [],
};