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
                serif: ["Playfair Display", "serif"],
            },
            colors: {
                primary: {
                    DEFAULT: '#FF8E8E', // Soft Coral
                    hover: '#FF7676',
                    light: '#FFB5B5',
                    dark: '#E67373',
                },
                background: '#fdfbf7', // Warm White / Ivory Paper
                surface: '#ffffff',
                secondary: '#9ca3af', // Cool Gray (Synced with Django)
                text: {
                    dark: '#1f2937', // Dark Gray (Synced with Django)
                    muted: '#95A5A6',
                },
                accent: '#FFB7B2',
                'cosmos-dark': '#1a1a2e',
                'starlight': '#fdfbf7',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
                'cosmos-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                'sunset-gradient': 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)',
            },
            borderRadius: {
                'pill': '9999px', // Synced with Django
                'card': '16px',   // Synced with Django
                'xl': '16px',
                '2xl': '24px',
                '3xl': '32px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                'card': '0 10px 30px rgba(0, 0, 0, 0.05)',
                'card-hover': '0 15px 35px rgba(0, 0, 0, 0.1)',
                'glow': '0 0 15px rgba(255, 142, 142, 0.5)',
                'neon': '0 0 10px rgba(255, 142, 142, 0.5), 0 0 20px rgba(255, 142, 142, 0.3)',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translate(0, 0)' },
                    '33%': { transform: 'translate(10px, -15px)' },
                    '66%': { transform: 'translate(-5px, 10px)' },
                },
                'slow-zoom': {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.1)' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'bounce-slow': {
                    '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
                    '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
                },
                'float-3d': {
                    '0%, 100%': { transform: 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)' },
                    '50%': { transform: 'translate3d(0, -10px, 10px) rotateX(2deg) rotateY(2deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(255, 142, 142, 0.5)' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 25px rgba(255, 142, 142, 0.8)' },
                },
                orbit: {
                    '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
                },
            },
            animation: {
                float: 'float 12s ease-in-out infinite',
                'slow-zoom': 'slow-zoom 20s infinite alternate ease-in-out',
                'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
                'bounce-slow': 'bounce-slow 3s infinite',
                'float-3d': 'float-3d 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'orbit': 'orbit 20s linear infinite',
            },
        },
    },
    plugins: [],
};
export default config;
