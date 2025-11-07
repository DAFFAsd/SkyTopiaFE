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
            'sidebar-bg': '#FFFFFF',
            'sidebar-text': '#5A6A85',
            'active-pink': '#FDF4F8',
            'active-pink-text': '#D36F9D',
            'welcome-yellow': '#FDFACF',
            'stat-pink-bg': '#FFE1F1',
            'stat-blue-bg': '#87B9FF',
            'button-transfer': '#6E44FF', 
            'button-edit': '#3B82F6',   
            'button-delete': '#EF4444', 
            'profile-banner': '#E0EFFF',
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