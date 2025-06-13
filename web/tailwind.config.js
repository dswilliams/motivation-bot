/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-blue-600',
    'hover:bg-blue-700',
    'text-white',
    'border-black',
    'border-2',
    'border',
    'rounded',
    'w-full',
    'font-bold',
    'py-3',
    'transition',
    'focus:ring-2',
    'focus:ring-blue-500',
  ],
} 