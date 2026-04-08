# Healthcare OS

A unified operating system for healthcare facilities, combining AI-driven patient acquisition, automated reactivation, clinical documentation, and practice management into a single, high-fidelity platform.

## Features

### 🎙️ Scribe AI
- **Automated Clinical Documentation**: Near-zero latency transcription and SOAP note generation.
- **RAG-Powered Knowledge Base**: Access to medical literature and clinic-specific protocols.
- **Multi-modal Inputs**: Voice, text, and image support for diverse clinical data capture.

### 🏩 Helpdoc CRM & Revenue Platform
- **Intelligent Patient Recovery**: Automated re-engagement for no-shows and dormant patients.
- **Encounter Management**: Comprehensive tracking of patient journeys from booking to completion.
- **Billing & Stripe Integration**: Seamless financial management and revenue recovery.
- **Supabase & Prisma Powered**: High-performance data layer with strict RBAC and HIPAA-readiness.

## Architecture

Built with a "Warm Clinical Precision" aesthetic using:
- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL) + Prisma ORM
- **Styling**: Tailwind CSS 4.0 + Geist font
- **AI Stack**: Anthropic Claude & Gemini Agentic Fleet
- **Communication**: Twilio SMS & SendGrid Email

## Getting Started

```bash
npm run dev
```

## Setup

1. Copy `.env.example` to `.env.local` and add your keys.
2. Initialize the database:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```
