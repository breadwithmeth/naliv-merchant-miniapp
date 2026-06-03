/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        foreground: '#FAFAFA',
        card: '#0F0F0F',
        mutedSurface: '#1A1A1A',
        accent: '#FF3D00',
        accentForeground: '#0A0A0A',
        input: '#1A1A1A',
        brand: {
          50: '#2A1208',
          100: '#451B0B',
          500: '#FF3D00',
          600: '#FF3D00',
          700: '#FF6A33',
        },
        ink: '#FAFAFA',
        muted: '#737373',
        line: '#262626',
      },
      boxShadow: {
        soft: 'none',
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
