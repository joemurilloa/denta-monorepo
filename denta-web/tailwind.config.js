/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                accent: {
                    DEFAULT: '#1a6ef5',
                    light: '#eff4ff',
                },
                base: '#f5f7fa',
                surface: '#ffffff',
                subtle: '#eef1f6',
                border: '#e2e6ed',
                success: {
                    DEFAULT: '#059669',
                    light: '#ecfdf5',
                },
                warning: {
                    DEFAULT: '#d97706',
                    light: '#fffbeb',
                },
                danger: {
                    DEFAULT: '#dc2626',
                },
                text: {
                    primary: '#111827',
                    secondary: '#6b7280',
                    tertiary: '#9ca3af',
                }
            },
            fontFamily: {
                serif: ['"Instrument Serif"', 'serif'],
                sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
                mono: ['"Geist Mono"', 'monospace'],
            },
            borderRadius: {
                'card': '12px',
                'button': '8px',
            },
            boxShadow: {
                'premium': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
            },
        },
    },
    plugins: [],
}
