import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // After OAuth, check if onboarding is needed
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const onboardingCompleted = user?.user_metadata?.onboarding_completed === true;
      const redirectTo = onboardingCompleted ? next : "/onboarding";

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
