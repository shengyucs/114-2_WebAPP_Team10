/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-sidebar': 'var(--bg-sidebar)',
        'border-color': 'var(--border-color)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'accent-color': 'var(--accent-color)',
        'accent-hover': 'var(--accent-hover)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        detail: 'var(--shadow-detail)',
      },
      spacing: {
        sidebar: 'var(--sidebar-width)',
        timeline: 'var(--timeline-height)',
      },
    },
  },
  plugins: [],
};
