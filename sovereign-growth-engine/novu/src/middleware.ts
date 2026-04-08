import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key', {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: { name: string, value: string, options: any }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const protectedPaths = ["/dashboard", "/pipeline", "/inbox", "/sequences", "/generate", "/contacts", "/analytics", "/integrations", "/settings", "/onboarding"];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));
  if (isProtected && !user) { const url = request.nextUrl.clone(); url.pathname = "/login"; return NextResponse.redirect(url); }
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  supabaseResponse.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  return supabaseResponse;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
