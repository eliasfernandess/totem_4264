import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00AE9D',
        'primary-hover': '#008C7E',
        secondary: '#003641',
        'green-medium': '#7DB61C',
        'green-light': '#C9D200',
        accent: '#49479D',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'confetti': 'confetti 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      minHeight: {
        '16': '4rem',
      },
    },
  },
  plugins: [],
}

export default config
