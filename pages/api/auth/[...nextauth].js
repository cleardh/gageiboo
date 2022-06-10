import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET
        })
    ],
    callbacks: {
        async signIn({ account, profile }) {
            if (account.provider === 'google' && process.env.EMAIL.split(',').indexOf(profile.email) >= 0) {
                return true;
            }
            return false;
        }
    },
    secret: 'asdfknineunck12uid82jnu',
    pages: {
        error: '/error'
    }
});