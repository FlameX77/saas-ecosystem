# Novu: AI-Powered Revenue Recovery Platform for UAE Clinics

## 🏥 PRODUCT CONTEXT
**Novu** is a B2B SaaS that helps private UAE clinics recover lost revenue through:
- AI-powered claim denial analysis and resubmission
- Insurance eligibility pre-checks before appointments
- Smart payment collection workflows (reminders, installments)
- Real-time revenue intelligence dashboard
- AI assistant for billing staff

**Target Users**: Clinic CFOs, Revenue Cycle Managers, Billing Teams  
**Market**: UAE private healthcare (HAAD/DHA regulatory environment)  
**Stack**: Next.js 15, TypeScript, Supabase, Tailwind, Shadcn/UI  
**Brand**: Clinical authority meets modern fintech — think Bloomberg Terminal meets Apple Health

## 🎨 DESIGN DIRECTION
- **Aesthetic**: Luxury fintech meets clinical precision. Dark mode primary (#0A0F1C), electric teal accents (#00D4AA), and warm amber alerts (#F59E0B).
- **Typography**: Editorial New/Canela/Freight Display (Display) + JetBrains Mono/Söhne (Body).
- **Layout**: Asymmetric dashboard grid. Left navigation, center data-dense, right AI assistant.
- **Motion**: GSAP transitions, counter animations, timeline scrubbing.
- **3D Elements**: React Three Fiber + Rapier for revenue leak visualization.

## 🗄️ BACKEND ARCHITECTURE
### Supabase Schema:
- `clinics`, `claims`, `patients`, `insurance_policies`, `denial_patterns`, `payment_plans`, `revenue_events`, `ai_audit_log`

### Edge Functions:
- `analyze-denial`, `eligibility-check`, `payment-nudge`, `revenue-forecast`

## 📊 DASHBOARD FEATURES
1. KPI Strip with GSAP animations
2. Claims Kanban (Physics-based)
3. AI Insight Feed
4. Revenue Waterfall Chart
5. 30-Day Forecast
6. Alert Center

## 🧪 QUALITY STANDARDS
- Storybook stories for every component
- Jest unit tests for API routes
- Typed Supabase queries
- Lighthouse score >= 90
- Mobile-responsive (Tablet optimized)
