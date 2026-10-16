import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './server/repositories/db';

export const authOptions = {
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

        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: 'LOGIN',
            entity: 'AdminUser',
            entityId: user.id,
            timestamp: new Date()
          }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }: any) {
      if (user) {
        token.id = user.id;
      }
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
    async session({ session, token }: any) {
      if (token.sessionId) {
        (session as any).sessionId = token.sessionId;
      }
      if (session.user) {
        session.user.id = token.id || token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/admin`;
    },
  },
  events: {
    async signOut(message: any) {
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
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);
