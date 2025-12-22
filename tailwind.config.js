/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#4F75E3",
        "primary-hover": "#3D62CC",
        "primary-light": "#EEF2FF",
        "primary-dark": "#2563eb", // Keep existing
        "background-light": "#F3F7FF",
        "background-dark": "#0F172A",
        "card-light": "#FFFFFF",
        "card-dark": "#1E293B",
        "input-bg-light": "#F8FAFC",
        "input-bg-dark": "#334155",
        "text-main-light": "#1E293B",
        "text-main-dark": "#F8FAFC",
        "text-sub-light": "#64748B",
        "text-sub-dark": "#94A3B8",
        "border-light": "#E2E8F0",
        "border-dark": "#475569",
        "accent": "#6366F1",
        // Keep existing branded colors if needed for other views, or alias them
        "brand-primary": "#5075dc",
        "brand-primary-dark": "#3b5bb5",
        "brand-bg": "#eff4fc",
        "input-bg": "#f8fafc",
        "text-main": "#0f172a",
        "text-secondary": "#64748b",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1e293b",
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 20px 40px -10px rgba(79, 117, 227, 0.1)',
        'glow': '0 0 15px rgba(79, 117, 227, 0.3)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        "card": "0 20px 40px -10px rgba(80, 117, 220, 0.15), 0 10px 20px -5px rgba(80, 117, 220, 0.05)",
        "input-focus": "0 0 0 4px rgba(79, 117, 227, 0.1)",
        "btn": "0 10px 20px -5px rgba(80, 117, 220, 0.4)",
        "btn-hover": "0 15px 25px -5px rgba(80, 117, 220, 0.5)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out 0.1s backwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
