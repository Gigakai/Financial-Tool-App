const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales Banorte
        banorte: {
          red: '#EB0029',
          gray: '#58616D',
          white: '#FFFFFF',
        },
        // Colores adicionales
        positive: '#6CCC4A',
        alert: '#FF671B',
        warning: '#FFA400',
        link: '#EB0029',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { boxShadow: '0 4px 14px rgba(235, 0, 41, 0.4)' },
          '50%': { boxShadow: '0 4px 20px rgba(235, 0, 41, 0.6)' },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      light: {
        colors: {
          primary: {
            DEFAULT: '#EB0029',
            foreground: '#FFFFFF',
          },
          secondary: {
            DEFAULT: '#58616D',
            foreground: '#FFFFFF',
          },
          success: {
            DEFAULT: '#6CCC4A',
            foreground: '#FFFFFF',
          },
          warning: {
            DEFAULT: '#FFA400',
            foreground: '#000000',
          },
          danger: {
            DEFAULT: '#FF671B',
            foreground: '#FFFFFF',
          },
        }
      }
    }
  })],
}
