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
    // Session-only configuration
    session: {
        strategy: 'jwt',
        // maxAge removed to default (or to rely on cookie clearing)
        // Note: Default maxAge is 30 days for JWT, but since cookie is session-only, 
        // the session effectively ends when browser closes.
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                // maxAge must be undefined to be a session cookie
            },
        },
    },
    // Ensure we trust the host for production (Vercel)
    trustHost: true,
    debug: true, // Enable debugging to trace 307 loop issues
} as any
