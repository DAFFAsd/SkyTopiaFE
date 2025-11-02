// tailwind.config.mjs

import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
const config = { 
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
        colors: {
            'new-sky-blue': '#B9DBF4',
            'brand-purple': '#504E80',
            'form-stroke': '#666666',
            'login-pink': '#D36F9D',
            'login-pink-focus': '#FACCD6',
        },
        fontFamily: {
            sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
            poppins: ['var(--font-poppins)', 'sans-serif'],
            rammetto: ['var(--font-rammetto)', 'cursive'],
        },
        },
    },
    plugins: [
        forms,
    ],
};

export default config;