// tailwind.config.js
const defaultTheme = require('./node_modules/daisyui/src/theming/themes')

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],

  daisyui: {
    themes: [
      {
        light: {
          ...defaultTheme['[data-theme=light]'],
          'base-100': '#F8FAFF',
        },
        dark: {
          ...defaultTheme['[data-theme=dark]'],
          'base-100': '#121212',
        },
      },
    ],
  },
}
