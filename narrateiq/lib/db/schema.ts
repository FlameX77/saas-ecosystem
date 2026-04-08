/**
 * NarrateIQ — Drizzle ORM Schema
 *
 * All tables are scoped to organizations for multi-tenancy.
 * User identity is managed by Supabase Auth; we reference auth.users(id)
 * via foreign keys but do not replicate user data here.
 *
 * RLS policies are defined in supabase/migrations/0001_initial.sql.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  numeric,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const orgPlanEnum = pgEnum("org_plan", [
  "free",
  "starter",
  "growth",
  "enterprise",
]);

export const memberRoleEnum = pgEnum("member_role", [
  "owner",
  "admin",
  "member",
]);

export const uploadStatusEnum = pgEnum("upload_status", [
  "pending",
  "processing",
  "parsed",
  "failed",
]);

export const fileTypeEnum = pgEnum("file_type", ["csv", "xlsx", "xls", "pdf"]);

export const dataTypeEnum = pgEnum("data_type", [
  "profit_loss",
  "balance_sheet",
  "cash_flow",
  "general_ledger",
  "unknown",
]);

export const reportTypeEnum = pgEnum("report_type", [
  "profit_loss",
  "balance_sheet",
  "cash_flow",
  "summary",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "draft",
  "generating",
  "ready",
  "failed",
]);

export const alertSeverityEnum = pgEnum("alert_severity", [
  "info",
  "warning",
  "critical",
]);

export const chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "trialing",
  "incomplete",
]);

// ─── Organizations ─────────────────────────────────────────────────────────────

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    /** URL-safe identifier, e.g. "acme-clinic" */
    slug: text("slug").notNull(),
    plan: orgPlanEnum("plan").notNull().default("free"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("organizations_slug_idx").on(t.slug),
    stripeCustomerIdx: index("organizations_stripe_customer_idx").on(
      t.stripeCustomerId
    ),
  })
);

// ─── Organization Members ──────────────────────────────────────────────────────

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    /** References auth.users(id) in Supabase */
    userId: uuid("user_id").notNull(),
    role: memberRoleEnum("role").notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uniqueMember: uniqueIndex("organization_members_unique_idx").on(
      t.organizationId,
      t.userId
    ),
    userIdx: index("organization_members_user_idx").on(t.userId),
  })
);

// ─── Uploads ──────────────────────────────────────────────────────────────────

export const uploads = pgTable(
  "uploads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    /** Uploader's auth.users(id) */
    userId: uuid("user_id").notNull(),
    /** Original file name as provided by the user */
    filename: text("filename").notNull(),
    fileType: fileTypeEnum("file_type").notNull(),
    /** File size in bytes */
    fileSizeBytes: integer("file_size_bytes").notNull(),
    /** Path within Supabase Storage bucket */
    storagePath: text("storage_path").notNull(),
    status: uploadStatusEnum("status").notNull().default("pending"),
    /** Error message if status = 'failed' */
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orgIdx: index("uploads_org_idx").on(t.organizationId),
    userIdx: index("uploads_user_idx").on(t.userId),
    statusIdx: index("uploads_status_idx").on(t.status),
  })
);

// ─── Parsed Data ──────────────────────────────────────────────────────────────

export const parsedData = pgTable(
  "parsed_data",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uploadId: uuid("upload_id")
      .notNull()
      .unique()
      .references(() => uploads.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    dataType: dataTypeEnum("data_type").notNull().default("unknown"),
    /** ISO date string for period start, e.g. "2024-01-01" */
    periodStart: text("period_start"),
    /** ISO date string for period end, e.g. "2024-12-31" */
    periodEnd: text("period_end"),
    /**
     * Normalized financial data conforming to FinancialData type.
     * Structure varies by data_type; always includes `rows` and `summary`.
     */
    rawData: jsonb("raw_data").notNull(),
    /** Source-specific metadata: column headers, sheet names, page count, etc. */
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orgIdx: index("parsed_data_org_idx").on(t.organizationId),
    dataTypeIdx: index("parsed_data_type_idx").on(t.dataType),
  })
);

// ─── Reports ──────────────────────────────────────────────────────────────────

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    /** Creator's auth.users(id) */
    userId: uuid("user_id").notNull(),
    uploadId: uuid("upload_id").references(() => uploads.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    type: reportTypeEnum("type").notNull(),
    status: reportStatusEnum("status").notNull().default("draft"),
    /**
     * Full rendered report content as structured JSON.
     * Shape: { sections: ReportSection[], generatedAt: string, model: string }
     */
    content: jsonb("content"),
    /** Additional metadata: token usage, generation time, etc. */
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orgIdx: index("reports_org_idx").on(t.organizationId),
    userIdx: index("reports_user_idx").on(t.userId),
    statusIdx: index("reports_status_idx").on(t.status),
    createdIdx: index("reports_created_idx").on(t.createdAt),
  })
);

// ─── Report Sections ──────────────────────────────────────────────────────────

export const reportSections = pgTable(
  "report_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reportId: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    /** e.g. "executive_summary" | "key_metrics" | "analysis" | "recommendations" */
    sectionType: text("section_type").notNull(),
    title: text("title").notNull(),
    /** Markdown-formatted section content */
    content: text("content").notNull(),
    /** Zero-indexed display order */
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    reportIdx: index("report_sections_report_idx").on(t.reportId),
  })
);

// ─── Variance Alerts ──────────────────────────────────────────────────────────

export const varianceAlerts = pgTable(
  "variance_alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    reportId: uuid("report_id").references(() => reports.id, {
      onDelete: "cascade",
    }),
    /** Human-readable metric name, e.g. "Gross Profit Margin" */
    metricName: text("metric_name").notNull(),
    /** Numeric value from prior period */
    previousValue: numeric("previous_value", { precision: 20, scale: 4 }),
    /** Numeric value from current period */
    currentValue: numeric("current_value", { precision: 20, scale: 4 }),
    /** Percentage change: (current - previous) / |previous| * 100 */
    variancePct: numeric("variance_pct", { precision: 10, scale: 2 }),
    severity: alertSeverityEnum("severity").notNull().default("info"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orgIdx: index("variance_alerts_org_idx").on(t.organizationId),
    isReadIdx: index("variance_alerts_read_idx").on(t.isRead),
  })
);

// ─── Chat Sessions ─────────────────────────────────────────────────────────────

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    reportId: uuid("report_id").references(() => reports.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull().default("New Conversation"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orgIdx: index("chat_sessions_org_idx").on(t.organizationId),
    userIdx: index("chat_sessions_user_idx").on(t.userId),
  })
);

// ─── Chat Messages ────────────────────────────────────────────────────────────

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => chatSessions.id, { onDelete: "cascade" }),
    role: chatRoleEnum("role").notNull(),
    content: text("content").notNull(),
    /** Optional: token usage, model name, latency_ms, etc. */
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    sessionIdx: index("chat_messages_session_idx").on(t.sessionId),
    createdIdx: index("chat_messages_created_idx").on(t.createdAt),
  })
);

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .unique()
      .references(() => organizations.id, { onDelete: "cascade" }),
    stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
    /** Stripe Price ID */
    stripePriceId: text("stripe_price_id").notNull(),
    plan: orgPlanEnum("plan").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
    }).notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    stripeSubIdx: uniqueIndex("subscriptions_stripe_sub_idx").on(
      t.stripeSubscriptionId
    ),
  })
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  members: many(organizationMembers),
  uploads: many(uploads),
  reports: many(reports),
  alerts: many(varianceAlerts),
  chatSessions: many(chatSessions),
  subscription: one(subscriptions, {
    fields: [organizations.id],
    references: [subscriptions.organizationId],
  }),
}));

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
  })
);

export const uploadsRelations = relations(uploads, ({ one }) => ({
  organization: one(organizations, {
    fields: [uploads.organizationId],
    references: [organizations.id],
  }),
  parsedData: one(parsedData, {
    fields: [uploads.id],
    references: [parsedData.uploadId],
  }),
}));

export const parsedDataRelations = relations(parsedData, ({ one }) => ({
  upload: one(uploads, {
    fields: [parsedData.uploadId],
    references: [uploads.id],
  }),
  organization: one(organizations, {
    fields: [parsedData.organizationId],
    references: [organizations.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [reports.organizationId],
    references: [organizations.id],
  }),
  upload: one(uploads, {
    fields: [reports.uploadId],
    references: [uploads.id],
  }),
  sections: many(reportSections),
  alerts: many(varianceAlerts),
  chatSessions: many(chatSessions),
}));

export const reportSectionsRelations = relations(reportSections, ({ one }) => ({
  report: one(reports, {
    fields: [reportSections.reportId],
    references: [reports.id],
  }),
}));

export const varianceAlertsRelations = relations(varianceAlerts, ({ one }) => ({
  organization: one(organizations, {
    fields: [varianceAlerts.organizationId],
    references: [organizations.id],
  }),
  report: one(reports, {
    fields: [varianceAlerts.reportId],
    references: [reports.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [chatSessions.organizationId],
    references: [organizations.id],
  }),
  report: one(reports, {
    fields: [chatSessions.reportId],
    references: [reports.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
}));

// ─── Profiles ─────────────────────────────────────────────────────────────────
// One profile per auth.users(id). Created during onboarding.

export const industryEnum = pgEnum("industry", [
  "clinic",
  "retail",
  "fnb",
  "services",
  "other",
]);

export const accountingSoftwareEnum = pgEnum("accounting_software", [
  "zoho_books",
  "quickbooks",
  "manual_csv",
  "other",
]);

export const reportingFrequencyEnum = pgEnum("reporting_frequency", [
  "monthly",
  "quarterly",
  "annual",
]);

export const profiles = pgTable(
  "profiles",
  {
    /** Matches auth.users(id) — not a Drizzle FK since auth schema is separate */
    id: uuid("id").primaryKey(),
    companyName: text("company_name").notNull(),
    industry: industryEnum("industry").notNull(),
    accountingSoftware: accountingSoftwareEnum("accounting_software").notNull(),
    reportingFrequency: reportingFrequencyEnum("reporting_frequency").notNull(),
    onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    onboardingIdx: index("profiles_onboarding_idx").on(t.onboardingCompleted),
  })
);

// ─── Narratives ───────────────────────────────────────────────────────────────

export const narrativeToneEnum = pgEnum("narrative_tone", [
  "board_meeting",
  "investor_update",
  "internal_review",
]);

export const narratives = pgTable(
  "narratives",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    reportId: uuid("report_id").references(() => reports.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id").notNull(),
    tone: narrativeToneEnum("tone").notNull().default("board_meeting"),
    /** Full markdown content of the generated narrative */
    content: text("content"),
    /**
     * Structured sections: { executiveSummary, revenueAnalysis,
     * costBreakdown, profitabilityCommentary, forwardLooking }
     */
    sections: jsonb("sections"),
    /** AI model used for generation */
    model: text("model"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orgIdx: index("narratives_org_idx").on(t.organizationId),
    reportIdx: index("narratives_report_idx").on(t.reportId),
    userIdx: index("narratives_user_idx").on(t.userId),
    createdIdx: index("narratives_created_idx").on(t.createdAt),
  })
);

export const narrativesRelations = relations(narratives, ({ one }) => ({
  organization: one(organizations, {
    fields: [narratives.organizationId],
    references: [organizations.id],
  }),
  report: one(reports, {
    fields: [narratives.reportId],
    references: [reports.id],
  }),
}));

// ─── Exported Type Helpers ────────────────────────────────────────────────────

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;

export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert;

export type ParsedData = typeof parsedData.$inferSelect;
export type NewParsedData = typeof parsedData.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

export type ReportSection = typeof reportSections.$inferSelect;
export type NewReportSection = typeof reportSections.$inferInsert;

export type VarianceAlert = typeof varianceAlerts.$inferSelect;
export type NewVarianceAlert = typeof varianceAlerts.$inferInsert;

export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Narrative = typeof narratives.$inferSelect;
export type NewNarrative = typeof narratives.$inferInsert;
