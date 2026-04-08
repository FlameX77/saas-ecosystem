# HelpDoc Enterprise Scribe — Implementation Guide

This project is a high-performance, enterprise-ready medical scribe application built with Next.js, Prisma, and Framer Motion.

## 🚀 Getting Started

### 1. Database
Ensure you have a PostgreSQL database running. Update `DATABASE_URL` in your `.env` file.
```bash
npx prisma db push
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in the required keys:
* **NEXTAUTH_SECRET**: (Automatically generated for you)
* **API_URL**: Defaulted to http://localhost:3000
* **TRANSCRIPTION_API**: Get a key from Deepgram
* **LLM_API**: Get a key from Anthropic (Claude 3.5 Sonnet)

### 3. Development
```bash
npm install
npm run dev
```

## 🏗️ Technical Architecture

### Multi-tenancy & Isolation
- **Prisma Schema**: Uses `clinicId` on all major models (Patients, Consultations, Notes) for strict data isolation.
- **Middleware**: Intercepts requests and ensures only authorized members of a clinic can access its data.

### Compliance & Auditing
- **Audit Logging**: Every action (Viewing a patient, generating a note, etc.) is automatically logged to the `AuditLog` table via `src/lib/audit.ts`.
- **Auto-deletion**: Logic prepared for auto-deleting audio after 24h (configurable).

### UI/UX
- **Design System**: Global styles in `src/app/globals.css`. Uses the **Geist** font family for a premium, clean look.
- **Animations**: Framer Motion variants in `src/lib/animations.ts`.

## 🛠️ Key Components
- `InteractiveSoapCard`: A specialized editor for medical findings.
- `AudioVisualizer`: Real-time frequency visualization during recording.
- `DashboardShell`: Core layout with multi-role sidebar protection.

## 📅 Maintenance
The project is built on **Next.js 15+ (App Router)** and **Prisma 5.x**. To keep it in sync with the latest medical standards, review the prompt engineering in `src/app/api/notes/route.ts` (to be implemented with API keys).

---
© 2026 ScribeAI Enterprise
