module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  darkMode: 'never', // ← Explicitly disable dark mode
  theme: {
    extend: {
      colors: {
        villageRed: '#83253bff',    
        villagePink: '#FCEAF0',   
      },
    },
  },
  plugins: [],
};