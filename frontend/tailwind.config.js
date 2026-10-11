/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        // Warm, minimal "coffee & parchment" theme. Brand tones only —
        // chart series colors are a separate, accessibility-validated set
        // (see src/charts) and intentionally don't pull from this scale.
        cream: {
          bg: '#F6EFE4',
          surface: '#FFFDF9',
          border: '#E6D8C3',
          borderSoft: '#EFE4D2',
        },
        espresso: {
          900: '#2E2118',
          700: '#4A3728',
        },
        brown: {
          100: '#F0E4D3',
          400: '#8B6644',
          500: '#7A5236',
          600: '#6B4A30',
          700: '#55391F',
        },
        taupe: {
          400: '#A6978A',
          500: '#8A7B6C',
        },
        sage: {
          50: '#EEF2E7',
          600: '#5F7754',
        },
        rust: {
          50: '#FBECE3',
          600: '#B3502A',
          700: '#96411F',
        },
        // Semantic money colors — deliberately separate from the brown/cream
        // chrome and from `rust` (which stays the generic form-error color).
        // Same hue everywhere an amount of that kind appears: stat cards,
        // transaction amounts/badges, budget bars, both charts.
        finance: {
          income: '#16a34a',
          incomeSoft: '#E7F5EC',
          investment: '#2563eb',
          investmentSoft: '#E8EFFD',
          expense: '#dc2626',
          expenseSoft: '#FCEAEA',
          expenseStrong: '#7f1d1d',
          subscription: '#ea580c',
          subscriptionSoft: '#FDEEE3',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(46, 33, 24, 0.06)',
        panel: '0 12px 32px rgba(46, 33, 24, 0.12)',
      },
    },
  },
  plugins: [],
};
