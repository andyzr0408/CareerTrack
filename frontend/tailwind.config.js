/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        sunken: token('sunken'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        brand: token('brand'),
        'brand-ink': token('brand-ink'),
        'brand-soft': token('brand-soft'),
        ok: token('ok'),
        'ok-soft': token('ok-soft'),
        warn: token('warn'),
        'warn-soft': token('warn-soft'),
        bad: token('bad'),
        'bad-soft': token('bad-soft'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pop: { from: { opacity: '0', transform: 'translateY(8px) scale(.98)' }, to: { opacity: '1', transform: 'none' } },
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
        rise: { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
        'heart-pop': { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.45) rotate(-8deg)' }, '100%': { transform: 'scale(1)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        grow: { from: { width: '0%' } },
        'toast-in': { from: { opacity: '0', transform: 'translateY(16px) scale(.96)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        pop: 'pop .18s ease-out',
        fade: 'fade .15s ease-out',
        rise: 'rise .45s cubic-bezier(.2,.7,.2,1) both',
        'heart-pop': 'heart-pop .4s ease-out',
        shimmer: 'shimmer 1.4s infinite',
        grow: 'grow .8s cubic-bezier(.2,.7,.2,1)',
        'toast-in': 'toast-in .28s cubic-bezier(.2,.7,.2,1)',
      },
    },
  },
  plugins: [],
};
