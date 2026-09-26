import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './server/repositories/db';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.adminUser.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash || user.status !== 'ACTIVE') return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user && trigger === 'signIn') {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const prismaSession = await prisma.session.create({
          data: {
            userId: user.id as string,
            expiresAt,
          },
        });
        token.sessionId = prismaSession.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sessionId) {
        (session as any).sessionId = token.sessionId;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      if ('token' in message && message.token?.sessionId) {
        await prisma.session.delete({
          where: { id: message.token.sessionId as string },
        }).catch(() => {});
      }
    },
  },
  pages: {
    signIn: '/admin/login',
  },
});
