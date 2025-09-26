/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  corePlugins: {
    preflight: false, // CRITICAL: Disable Tailwind's preflight to prevent MUI conflicts
  },
  important: '#__next', // Ensure Tailwind utilities take precedence
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fefdf8',
          100: '#fef8e7',
          200: '#fceec4',
          300: '#f9df9c',
          400: '#f5cc73',
          500: '#f0b847',
          600: '#e8a63a',
          700: '#d4902e',
          800: '#b87a2a',
          900: '#a67c00',
        },
        secondary: {
          50: '#f7f6f4',
          100: '#edeae6',
          200: '#dad4cd',
          300: '#c4b8ad',
          400: '#b0a398',
          500: '#9d8f84',
          600: '#8a7b70',
          700: '#746354',
          800: '#5d4f42',
          900: '#4a3d32',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
