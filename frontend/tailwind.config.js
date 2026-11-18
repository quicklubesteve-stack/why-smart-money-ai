/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06080d',
          900: '#0b0f19',
          850: '#111726',
          800: '#192237',
          700: '#23304c',
          600: '#34466b',
        },
        accent: {
          green: '#10b981',
          emerald: '#059669',
          red: '#ef4444',
          cyan: '#06b6d4',
          indigo: '#6366f1',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
