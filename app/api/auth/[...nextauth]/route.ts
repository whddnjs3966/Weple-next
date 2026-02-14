
import NextAuth from "next-auth"
import NaverProvider from "next-auth/providers/naver"

const handler = NextAuth({
    providers: [
        NaverProvider({
            clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "",
            clientSecret: process.env.NAVER_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async session({ session, token }: { session: any; token: any }) {
            // Send properties to the client, like an access_token from a provider.
            return session
        },
    },
    // Ensure we trust the host for production (Vercel)
    trustHost: true,
} as any)

export { handler as GET, handler as POST }
