import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#314C5D',
          lime: '#DEFF66',
          pink: '#FF6B8A',
          teal: '#4ECDC4',
          'light-blue': '#29D4FF',
          orange: '#FF8C69',
        },
        bg: {
          DEFAULT: '#F5F6F8',
          card: '#FFFFFF',
        },
        status: {
          error: '#EF4444',
          success: '#22C55E',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
