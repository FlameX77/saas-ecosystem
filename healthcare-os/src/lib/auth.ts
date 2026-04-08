import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import prisma from './prisma'
import { UserRole } from './types'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: UserRole
      clinicId?: string
      clinicSlug?: string
    }
  }

  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    clinicId?: string
    clinicSlug?: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/auth/error' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            clinicMemberships: {
              include: { clinic: true },
              take: 1, // Simplify for demo/v1: get first clinic
            },
          },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        // Fetch clinic if we just logged in
        const membership = await prisma.clinicMember.findFirst({
          where: { userId: user.id },
          include: { clinic: true },
        })
        if (membership) {
          token.clinicId = membership.clinicId
          token.clinicSlug = membership.clinic.slug
        }
      }

      if (trigger === 'update' && session?.clinicId) {
        token.clinicId = session.clinicId
        token.clinicSlug = session.clinicSlug
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.clinicId = token.clinicId
        session.user.clinicSlug = token.clinicSlug
      }
      return session
    },
  },
}
