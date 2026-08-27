/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#12301F',
        'forest-deep': '#0A1B12',
        moss: '#2E5E42',
        cream: '#FDF8E3',
        bone: '#F6F4EE',
        slate: '#3D4440',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
      },
      maxWidth: {
        '7xl': '80rem',
      },
    },
  },
  plugins: [],
};
