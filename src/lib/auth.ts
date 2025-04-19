// lib/auth.ts
import NextAuth, { type NextAuthOptions, type User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { User as UserModel } from './models/User';
import dbConnect from './dbConnect';

// Extend the User type with your custom fields
interface IUser extends User {
    id: string;
    role?: string;
    group?: string;
}

// Extend the default session types
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name?: string;
            email?: string;
            role?: string;
            group?: string;
        };
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials): Promise<IUser | null> {
                await dbConnect();

                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const user = await UserModel.findOne({ email: credentials.email });
                if (!user) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
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
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as IUser).id;
                token.role = (user as IUser).role;
                token.group = (user as IUser).group;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.group = token.group as string;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
};

export default NextAuth(authOptions);