# ScribeAI 🩺

AI-powered medical scribe for doctors. Record consultations, auto-generate SOAP notes, manage patients.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL + RLS) |
| **Auth** | Supabase Auth (`@supabase/ssr`) |
| **AI Transcription** | OpenAI Whisper |
| **AI Note Generation** | Anthropic Claude |
| **Payments** | Stripe |
| **Forms** | React Hook Form + Zod |
| **PDF Export** | jsPDF + html2canvas |
| **Icons** | Lucide React |

## Project Structure

```
src/
  app/
    (auth)/          # Login & Signup (public)
    (dashboard)/     # Protected app routes
      page.tsx           ← Main scribe screen
      patients/          ← Patient list & profiles
      notes/             ← Note history
      settings/          ← Account & billing
    api/             # API Route Handlers
      transcribe/        ← Whisper audio transcription
      generate-note/     ← Claude SOAP note generation
      patients/          ← Patient CRUD
      consultations/     ← Consultation records
      webhooks/stripe/   ← Stripe billing events
  components/
    AudioRecorder.tsx
    SOAPNote.tsx
    PatientCard.tsx
    PatientSelector.tsx
    NoteHistory.tsx
    PrescriptionSuggestions.tsx
    ui/              # Reusable design system
  lib/
    supabase/        ← client, server, middleware helpers
    claude.ts        ← Anthropic SDK wrapper
    whisper.ts       ← OpenAI Whisper wrapper
    stripe.ts        ← Stripe SDK wrapper
    utils.ts         ← Shared utilities
  types/index.ts     ← Shared TypeScript types
  middleware.ts      ← Auth route protection
```

## Getting Started

1. Copy `.env.local` and fill in your keys
2. `npm install`
3. `npm run dev`
4. Visit `http://localhost:3000`
