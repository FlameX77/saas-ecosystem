import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isApi = req.nextUrl.pathname.startsWith('/api')

    // Basic role check: Only SUPER_ADMIN can access clinic admin features etc
    // In production, we'd check against more granular RBAC

    if (isDashboard && !token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Role-based redirection examples
    // if (token?.role === 'SUPER_ADMIN' && req.nextUrl.pathname === '/dashboard') {
    //   return NextResponse.redirect(new URL('/dashboard/admin', req.url))
    // }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/patients/:path*',
    '/api/consultations/:path*',
    '/api/notes/:path*',
    '/api/templates/:path*',
    '/api/settings/:path*',
  ],
}
