/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{ts,tsx,js,jsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                bg: 'var(--bg)',
                panel: 'var(--panel)',
                text: 'var(--text)',
                muted: 'var(--muted)',
                line: 'var(--line)',
                accent: 'var(--accent)'
            },
            boxShadow: {
                luxury: '0 10px 30px rgba(0,0,0,.35)'
            },
            borderRadius: {
                xl: '16px'
            },
            fontFamily: {
                inter: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif']
            }
        },
    },
    plugins: [],
}


