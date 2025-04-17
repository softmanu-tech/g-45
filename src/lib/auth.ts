// lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from './models/User';
import dbConnect from './dbConnect';

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await dbConnect();

                const user = await User.findOne({ email: credentials?.email });
                if (!user) return null;

                const isValid = await bcrypt.compare(credentials?.password || '', user.password);
                if (!isValid) return null;

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    group: user.group?.toString()
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.role = user.role;
                token.group = user.group;
            }
            return token;
        },
        async session({ session, token }: { session: any, token: any }) {
            session.user.role = token.role;
            session.user.group = token.group;
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);