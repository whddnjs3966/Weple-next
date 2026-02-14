import { NextAuthOptions } from "next-auth"
import NaverProvider from "next-auth/providers/naver"

export const authOptions: NextAuthOptions = {
    providers: [
        NaverProvider({
            clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "",
            clientSecret: process.env.NAVER_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async session({ session, token }: { session: any; token: any }) {
            return session
        },
    },
    // Session-only configuration
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days (but cookie will be session-only)
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                // maxAge: removed to make it a session cookie
            },
        },
    },
    // Ensure we trust the host for production (Vercel)
    trustHost: true,
} as any
