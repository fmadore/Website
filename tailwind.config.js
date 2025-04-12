/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)', // #1a365d / #58a6ff
        'primary-dark': 'var(--color-primary-dark)', // #11243e / #4d88ff
        secondary: 'var(--color-secondary)', // #4b5563 / #9ca3af
        accent: 'var(--color-accent)', // #7c3aed / #a582ff
        highlight: 'var(--color-highlight)', // #e07c3e / #ff9c66
        success: 'var(--color-success)', // #2f855a / #68d391
        background: 'var(--color-background)', // #ffffff / #111827
        text: 'var(--color-text)', // #1a202c / #e5e7eb
        'text-light': 'var(--color-text-light)', // #4a5568 / #9ca3af
        border: 'var(--color-border)', // #e2e8f0 / #374151
        'footer-bg': 'var(--color-footer-bg)', // #1f2937 / #0f172a
        'footer-text': 'var(--color-footer-text)', // #f9fafb / #d1d5db
        'footer-text-muted': 'var(--color-footer-text-muted)', // rgba(255, 255, 255, 0.7) / rgba(209, 213, 219, 0.7)
        'sidebar-bg': 'var(--color-sidebar-bg)', // #f9fafb / #1f2937
      },
      spacing: {
        '1': 'var(--spacing-1)', // 0.25rem
        '2': 'var(--spacing-2)', // 0.5rem
        '3': 'var(--spacing-3)', // 0.75rem
        '4': 'var(--spacing-4)', // 1rem
        '6': 'var(--spacing-6)', // 1.5rem
        '8': 'var(--spacing-8)', // 2rem
        '12': 'var(--spacing-12)', // 3rem
        '16': 'var(--spacing-16)', // 4rem
      },
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        serif: ['var(--font-family-serif)'],
        mono: ['var(--font-family-mono)'],
      },
      fontSize: {
        'xs': 'var(--font-size-xs)', // 0.75rem
        'sm': 'var(--font-size-sm)', // 0.875rem
        'base': 'var(--font-size-base)', // 1rem
        'lg': 'var(--font-size-lg)', // 1.125rem
        'xl': 'var(--font-size-xl)', // 1.25rem
        '2xl': 'var(--font-size-2xl)', // 1.5rem
        '3xl': 'var(--font-size-3xl)', // 1.875rem
        '4xl': 'var(--font-size-4xl)', // 2.25rem
      },
      borderRadius: {
        sm: 'var(--border-radius-sm)', // 0.125rem
        DEFAULT: 'var(--border-radius)', // 0.25rem
        md: 'var(--border-radius-md)', // 0.375rem
        lg: 'var(--border-radius-lg)', // 0.5rem
        xl: 'var(--border-radius-xl)', // 0.75rem
        '2xl': 'var(--border-radius-2xl)', // 1rem
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}; 