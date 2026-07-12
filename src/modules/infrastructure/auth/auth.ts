import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { AuthenticateUserService } from '@/modules/application/auth/authenticate-user.service';
import { PrismaUserRepository } from '@/modules/infrastructure/repositories/prisma-user.repository';
import { loginSchema } from '@/shared/schemas/auth.schema';

/**
 * Auth.js configuration for credentials-based sessions.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/en/login',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        try {
          const service = new AuthenticateUserService(new PrismaUserRepository());
          const user = await service.execute(parsed.data);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            locale: user.locale,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
        token.locale = user.locale;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.locale = typeof token.locale === 'string' ? token.locale : 'en';
      }
      return session;
    },
  },
});
