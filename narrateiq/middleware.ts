import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that require authentication
const PROTECTED_PATHS = ["/dashboard", "/upload", "/reports", "/chat", "/alerts", "/settings"];
// Auth pages that redirect authenticated users away
const AUTH_PATHS = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required for Server Components to read fresh auth state
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const isOnboarding = pathname.startsWith("/onboarding");

  // 1. Unauthenticated user hitting a protected or onboarding route → login
  if (!user && (isProtected || isOnboarding)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user hitting login/signup → dashboard
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (user) {
    const onboardingCompleted = user.user_metadata?.onboarding_completed === true;

    // 3. Authenticated, onboarding incomplete, hitting dashboard → onboarding
    if (isProtected && !onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // 4. Authenticated, onboarding complete, hitting /onboarding → dashboard
    if (isOnboarding && onboardingCompleted) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
