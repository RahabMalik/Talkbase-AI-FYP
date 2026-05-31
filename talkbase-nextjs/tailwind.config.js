/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          blue:       '#2563EB',
          bluehover:  '#1D4ED8',
          bluelight:  '#EFF6FF',
          bluemid:    '#DBEAFE',
          primary:    '#0F172A',
          secondary:  '#475569',
          muted:      '#94A3B8',
          border:     '#E2E8F0',
          bg:         '#F8FAFC',
        },
      },
    },
  },
  plugins: [],
}
