/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Electronic Government Standard Colors simulation
                primary: '#2563eb', // blue-600
                secondary: '#475569', // slate-600
            },
            fontFamily: {
                sans: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
