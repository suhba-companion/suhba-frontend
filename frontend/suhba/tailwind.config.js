/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Green scale (darkest → lightest) ──────────────────────────────
        // green-900  #051F20  near-black dark green   → buttons, nav active
        // green-800  #092625  very dark teal          → badges
        // green-700  #163832  dark forest green       → sand, gradients
        // green-600  #235347  medium dark green       → moss, filter buttons
        // green-500  #4A7C6E  medium teal-green       → selected, hover states
        // green-400  #8EB69B  sage green              → icons, accents
        // green-300  #b5d4bc  light sage              → borders, tints
        // green-100  #DAF1DE  pale mint               → chip backgrounds
        green: {
          900: '#051F20',
          800: '#092625',
          700: '#163832',
          600: '#235347',
          500: '#4A7C6E',
          400: '#8EB69B',
          300: '#b5d4bc',
          100: '#DAF1DE',
        },

        // ── Semantic aliases (map to green scale) ─────────────────────────
        primary:      '#051F20', // green-900 — main dark green
        badge:        '#092625', // green-800 — active badge bg
        sand:         '#163832', // green-700 — dark accent / gradient start
        moss:         '#235347', // green-600 — buttons, filter toggle
        selected:     '#4A7C6E', // green-500 — hover states, active overlay
        sage:         '#8EB69B', // green-400 — secondary icon/accent
        'sage-light': '#b5d4bc', // green-300 — borders, light accents
        'sage-tint':  '#DAF1DE', // green-100 — chip/pill backgrounds

        // ── Neutrals ──────────────────────────────────────────────────────
        'cream-bg':   '#FFFFFF', // screen background
        'cream-card': '#FFFFFF', // card background
        divider:      '#E2E8F0', // borders, separators
        'text-dark':  '#0F172A', // primary text
        'text-muted': '#64748B', // secondary / label text

        // ── Legacy (kept for backwards compat) ───────────────────────────
        'primary-dark':   '#051F20',
        'btn-primary':    '#051F20',
        'btn-secondary':  '#163832',
        'btn-ghost':      '#DAF1DE',
      },

      fontFamily: {
        amiri: ["'Amiri'", 'serif'],
      },

      borderRadius: {
        card: '11px',
        pill: '20px',
      },

      backgroundImage: {
        'hero-gradient': 'linear-gradient(140deg, #051F20, #235347)',
        'tip-gradient':  'linear-gradient(140deg, #163832, #235347)',
      },
    },
  },
  plugins: [],
}
