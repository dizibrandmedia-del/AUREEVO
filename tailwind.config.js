/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          darkest: '#04100c',
          dark: '#071a14',
          emerald: '#0b2820',
          rich: '#0f382d',
          surface: '#144638',
          card: '#0d2d24',
          border: '#1b4b3c',
          gold: '#d4af37',
          'gold-light': '#f3e5ab',
          'gold-dark': '#997a15',
          'gold-hover': '#e6ca65',
          muted: '#8eaba1',
          text: '#f8faf9',
        },
      },
      fontFamily: {
        serif: ['var(--font-cinzel)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f3e5ab 0%, #d4af37 50%, #aa820a 100%)',
        'emerald-gradient': 'linear-gradient(180deg, #071a14 0%, #0b2820 100%)',
        'dark-glass': 'linear-gradient(135deg, rgba(11, 40, 32, 0.7) 0%, rgba(7, 26, 20, 0.85) 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px -3px rgba(212, 175, 55, 0.25)',
        'emerald-glow': '0 10px 30px -10px rgba(7, 26, 20, 0.8)',
      },
    },
  },
  plugins: [],
};
