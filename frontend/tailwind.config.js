/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          primary: '#0066FF',
          secondary: '#00D4AA',
          accent: '#FF6B00',
          neutral: '#2D3748',
        },
        risk: {
          low: '#48BB78',
          medium: '#ED8936',
          high: '#F56565',
        },
      },
      animation: {
        'quantum-pulse': 'quantum-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'quantum-pulse': {
          '0%, 100%': { opacity: 0.8 },
          '50%': { opacity: 1.0 },
        },
      },
    },
  },
  plugins: [],
}
