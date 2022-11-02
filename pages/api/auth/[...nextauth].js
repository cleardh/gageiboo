import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
const authProvider = process.env.AUTH_PROVIDER;
let auth = null;
if (authProvider === 'google') {
    auth = {
        providers: [
            GoogleProvider({
                clientId: process.env.GOOGLE_ID,
                clientSecret: process.env.GOOGLE_SECRET
            })
        ],
        callbacks: {
            async signIn({ account, profile }) {
                const credentials = process.env.CREDENTIALS.split('/');
                const auth_users = credentials.map(u => ({
                    email: u.split(',')[0],
                    password: u.split(',')[1],
                }));
                if (account.provider === 'google') {
                    return true;
                }
                return false;
            }
        },
        secret: process.env.JWT_SECRET,
        pages: {
            error: '/error'
        }
    }
} else {
    auth = {
        providers: [
            CredentialsProvider({
                async authorize(credentials) {
                    let user;
                    if (credentials.email && credentials.password) user = { email: credentials.email, password: credentials.password };
                    if (user) {
                        return user;
                    }
                    return null;
                }
            })
        ],
        callbacks: {
            async signIn({ user }) {
                const credentials = process.env.CREDENTIALS.split('/');
                const auth_users = credentials.map(u => ({
                    email: u.split(',')[0],
                    password: u.split(',')[1],
                }));
                if (auth_users.findIndex(u => user.email === u.email && user.password === u.password) >= 0) {
                    return true;
                }
                return false;
            },
            async jwt({ token, user }) {
                if (user) token.user = { email: user.email };
                return token;
            },
            async session({ session, token }) {
                session.user = token.user;
                return session;
            }
        },
        secret: process.env.JWT_SECRET,
        pages: {
            error: '/error'
        }
    };
}
export default NextAuth(auth);