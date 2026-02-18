import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                pretendard: ["Pretendard", "sans-serif"],
                serif: ["Cormorant Garamond", "serif"],
                cursive: ["Dancing Script", "cursive"],
                cinzel: ["var(--font-cinzel)", "serif"],
            },
            colors: {
                primary: {
                    DEFAULT: '#F9A8D4', // pink-300
                    hover: '#F472B6',   // pink-400
                    light: '#FBCFE8',   // pink-200
                    dark: '#EC4899',    // pink-500
                },
                blush: '#FDF2F8',       // main background
                cream: '#FFFBF0',       // card background
                ivory: '#FFF8F0',       // alt card bg
                gold: '#D4A373',        // ring / accent
                sage: '#A7C4A0',        // completed / success
                background: '#FDF2F8',  // warm blush
                surface: '#ffffff',
                secondary: '#9ca3af',
                text: {
                    dark: '#1F2937',    // gray-800
                    muted: '#6B7280',   // gray-500
                },
                accent: '#FBCFE8',      // pink-200
                pink: {
                    50: '#FDF2F8',
                    100: '#FCE7F3',
                    200: '#FBCFE8',
                    300: '#F9A8D4',
                    400: '#F472B6',
                    500: '#EC4899',
                    600: '#DB2777',
                    700: '#BE185D',
                    800: '#9D174D',
                    900: '#831843',
                },
                rose: {
                    50: '#FFF1F2',
                    100: '#FFE4E6',
                    200: '#FECDD3',
                    300: '#FDA4AF',
                    400: '#FB7185',
                    500: '#F43F5E',
                    600: '#E11D48',
                    700: '#BE185D',
                    800: '#9F1239',
                    900: '#881337',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'spring-gradient': 'linear-gradient(135deg, #fdfbf7 0%, #fff0f5 50%, #FDF2F8 100%)',
                'petal-gradient': 'linear-gradient(135deg, #F9A8D4 0%, #FBCFE8 50%, #FCE7F3 100%)',
                'rose-gradient': 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)',
                'sunset-gradient': 'linear-gradient(135deg, #F9A8D4 0%, #FBCFE8 99%, #FCE7F3 100%)',
                'hero-gradient': 'linear-gradient(160deg, #fdfbf7 0%, #FDF2F8 30%, #FCE7F3 60%, #fff0f5 100%)',
            },
            borderRadius: {
                'pill': '9999px',
                'card': '16px',
                'xl': '16px',
                '2xl': '24px',
                '3xl': '32px',
            },
            boxShadow: {
                'petal': '0 8px 32px 0 rgba(249, 168, 212, 0.10)',
                'card': '0 10px 30px rgba(249, 168, 212, 0.06)',
                'card-hover': '0 15px 35px rgba(249, 168, 212, 0.12)',
                'ring-glow': '0 0 15px rgba(212, 163, 115, 0.4)',
                'rose-glow': '0 0 20px rgba(249, 168, 212, 0.3), 0 0 40px rgba(249, 168, 212, 0.1)',
                'soft': '0 2px 15px rgba(0, 0, 0, 0.04)',
            },
            keyframes: {
                'petal-fall': {
                    '0%': { transform: 'translateY(-10%) rotate(0deg)', opacity: '0' },
                    '10%': { opacity: '1' },
                    '90%': { opacity: '1' },
                    '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
                },
                bloom: {
                    '0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' },
                    '50%': { transform: 'scale(1.1) rotate(0deg)', opacity: '1' },
                    '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                'sway': {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
            },
            animation: {
                'petal-fall': 'petal-fall 8s linear infinite',
                bloom: 'bloom 0.6s ease-out forwards',
                'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
                float: 'float 4s ease-in-out infinite',
                sway: 'sway 6s ease-in-out infinite',
                shimmer: 'shimmer 3s ease-in-out infinite',
                'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};
export default config;
