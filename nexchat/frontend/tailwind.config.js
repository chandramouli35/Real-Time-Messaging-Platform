/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0d0d0d',
          secondary: '#141414',
          card: '#1a1a1a',
        },
        border: {
          DEFAULT: '#2a2a2a',
        },
        primary: {
          from: '#6366f1',
          to: '#8b5cf6',
          glow: 'rgba(99,102,241,0.5)',
        },
        accent: {
          from: '#06b6d4',
          to: '#0891b2',
        },
        success: '#10b981',
        error: '#ef4444',
        text: {
          primary: '#ffffff',
          secondary: '#9ca3af',
          muted: '#4b5563',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #6366f1, #8b5cf6)',
        'gradient-accent': 'linear-gradient(to right, #06b6d4, #0891b2)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(99,102,241,0.5)',
        'glow-accent': '0 0 20px rgba(6,182,212,0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
