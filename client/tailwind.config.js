/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: {
          DEFAULT: '#0b0d19', // Deep space blue
          card: '#121426',    // Dark navy card/sidebar
          border: '#1f243d',  // Luxury card border
          hover: '#1b1e38',   // Card hover state
        },
        brand: {
          DEFAULT: '#5c42ff', // Neon purple/blue accent
          hover: '#4b33e6',
          purple: '#8a2be2',
          blue: '#00d2ff',
        },
        luxuryGold: '#ffb703', // Minor accents
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
