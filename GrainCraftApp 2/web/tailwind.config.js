/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B7355',
        secondary: '#D4A574',
        success: '#4CAF50',
        error: '#EF5350',
        warning: '#FFC107',
        info: '#2196F3',
        dark: '#1A1A1A',
        light: '#F5F5F5',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.1)',
        hover: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
