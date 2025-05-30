module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}', // Include all files in the src folder
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        tangerine: ['Tangerine', 'sans-serif'],
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        scroll: 'scroll var(--scroll-duration, 20s) linear infinite',
      },
      colors: {
        stone: "#4B4A44",
        taupe: "#b9b4a8",
        linen: "#e2dfd1",
        parchment: "#f0eee2",
        beige: "#dbd5c5",
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};