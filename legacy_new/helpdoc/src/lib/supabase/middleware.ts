import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // HIPAA Session Timeout (15 minutes)
  const SESSION_TIMEOUT_MS = 15 * 60 * 1000
  if (user && !pathname.startsWith('/api/')) {
    const lastActiveCookie = request.cookies.get('sb-last-active')
    const lastActive = lastActiveCookie ? parseInt(lastActiveCookie.value, 10) : Date.now()
    
    if (Date.now() - lastActive > SESSION_TIMEOUT_MS) {
      // Session expired due to inactivity
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'Session expired due to inactivity')
      return NextResponse.redirect(url)
    }

    // Refresh last active
    supabaseResponse.cookies.set('sb-last-active', Date.now().toString(), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  // Public routes — no auth required
  const publicPaths = ['/login', '/signup', '/pricing', '/api/stripe/', '/api/webhooks']
  const isPublicRoute = pathname === '/' || publicPaths.some(p => pathname.startsWith(p))

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && !isPublicRoute && pathname !== '/onboarding') {
    // Check if the user has a doctor row
    const { data: doctor } = await supabase.from('doctors').select('id').eq('id', user.id).single()
    if (!doctor) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
