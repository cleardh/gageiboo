import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET
        })
        // CredentialsProvider({
        //     async authorize(credentials) {
        //         let user;
        //         if (credentials.email && credentials.password) user = { email: credentials.email, password: credentials.password };
        //         if (user) {
        //             return user;
        //         }
        //         return null;
        //     }
        // })
    ],
    callbacks: {
        async signIn({ account, profile }) {
            // if (account.provider === 'google' && process.env.EMAIL.split(',').indexOf(profile.email) >= 0) {
            //     return true;
            // }
            // return false;
            const credentials = process.env.CREDENTIALS.split('/');
            const auth_users = credentials.map(u => ({
                email: u.split(',')[0],
                password: u.split(',')[1],
            }));
            if (account.provider === 'google' && auth_users.findIndex(u => profile.email === u.email) >= 0) {
                return true;
            }
            return false;
        }
        // async signIn({ user }) {
        //     const credentials = process.env.CREDENTIALS.split('/');
        //     const auth_users = credentials.map(u => ({
        //         email: u.split(',')[0],
        //         password: u.split(',')[1],
        //     }));
        //     if (auth_users.findIndex(u => user.email === u.email && user.password === u.password) >= 0) {
        //         return true;
        //     }
        //     return false;
        // },
        // async jwt({ token, user }) {
        //     if (user) token.user = { email: user.email };
        //     return token;
        // },
        // async session({ session, token }) {
        //     session.user = token.user;
        //     return session;
        // }
    },
    secret: process.env.JWT_SECRET,
    pages: {
        error: '/error'
    }
});