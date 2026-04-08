import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createServer() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key', {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet: { name: string, value: string, options: any }[]) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
    },
  });
}
