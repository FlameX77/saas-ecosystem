import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/client";
import { profiles, organizations, organizationMembers } from "@/lib/db/schema";

const onboardingSchema = z.object({
  companyName: z.string().min(1).max(200).trim(),
  industry: z.enum(["clinic", "retail", "fnb", "services", "other"]),
  accountingSoftware: z.enum(["zoho_books", "quickbooks", "manual_csv", "other"]),
  reportingFrequency: z.enum(["monthly", "quarterly", "annual"]),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { companyName, industry, accountingSoftware, reportingFrequency } = parsed.data;

    // Run all DB writes in sequence (no transactions needed — each is idempotent)

    // 1. Create org
    const [org] = await db
      .insert(organizations)
      .values({
        name: companyName,
        slug: generateSlug(companyName),
        plan: "free",
      })
      .returning({ id: organizations.id });

    if (!org) {
      return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    }

    // 2. Create org member (owner)
    await db.insert(organizationMembers).values({
      organizationId: org.id,
      userId: user.id,
      role: "owner",
    });

    // 3. Create profile
    await db
      .insert(profiles)
      .values({
        id: user.id,
        companyName,
        industry,
        accountingSoftware,
        reportingFrequency,
        onboardingCompleted: true,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          companyName,
          industry,
          accountingSoftware,
          reportingFrequency,
          onboardingCompleted: true,
          updatedAt: new Date(),
        },
      });

    // 4. Mark onboarding complete in Supabase user metadata
    //    (read by middleware to skip the DB query on every request)
    await supabase.auth.updateUser({
      data: { onboarding_completed: true, organization_id: org.id },
    });

    return NextResponse.json({ success: true, organizationId: org.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/onboarding]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}
