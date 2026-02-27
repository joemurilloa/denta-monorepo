/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0ea5e9',
                    dark: '#0284c7',
                    light: '#38bdf8',
                    soft: 'rgba(14, 165, 233, 0.1)',
                },
            },
            fontFamily: {
                sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
            },
            borderRadius: {
                '2xl': '18px',
                '3xl': '24px',
            },
            boxShadow: {
                'ios-sm': '0 1px 2px rgba(0, 0, 0, 0.03)',
                'ios-md': '0 4px 12px rgba(0, 0, 0, 0.04)',
                'ios-lg': '0 12px 24px rgba(0, 0, 0, 0.06)',
            },
        },
    },
    plugins: [],
}
