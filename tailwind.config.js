/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0074ff',
          deep: '#0058c4',
          soft: '#e6f1ff',
        },
        navy: '#00304a',
        ink: '#0f172a',
        'ink-2': '#334155',
        'ink-3': '#64748b',
        bg: '#f7f8fa',
        line: '#e5e7eb',
        ok: '#059669',
        'ok-soft': '#ecfdf5',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
