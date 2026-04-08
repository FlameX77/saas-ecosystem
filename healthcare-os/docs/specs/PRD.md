# 🏥 ScribeAI: Unified Clinical Transcription & Knowledge Platform

> **Vision Statement**: To return 40% of clinical time to doctors and unify institutional knowledge through a seamless, AI-powered flywheel where every consultation note fuels clinical intelligence.

---

## 1. Executive Summary

**ScribeAI** is a dual-layer AI platform designed for private healthcare facilities in the UAE (DHA/HAAD) and India (NMC). It eliminates the documentation burden through a high-accuracy **AI Medical Scribe** and builds an organic **Clinical Knowledge Base (HelpDoc)** from those very consultations. This creates a "flywheel" effect: the more consultations a clinic processes, the more institutional knowledge it maps and stores, reducing errors, training time, and revenue leakage.

---

## 2. The Flywheel Core
1.  **CAPTURE**: ScribeAI listens to the doctor-patient encounter.
2.  **STRUCTURE**: Real-time transcription (Whisper) is structured into SOAP notes (GPT-4o).
3.  **INGEST**: Approved notes are chunked and embedded into a vector database (HelpDoc).
4.  **RETRIEVE**: Staff and doctors query the knowledge base, refined by clinic-specific terminology and protocols.

---

## 3. User Personas

### 👨‍⚕️ The Doctor (Primary)
*   **Need**: Reduce clicks and typing during and after consultations.
*   **Experience**: Tablet-first, real-time feedback, ICD-10/CPT coding automation, one-click EMR sync.

### 👩‍💼 Clinic Admin / Front Desk
*   **Need**: Fast answers to patient questions, protocol consistency, easier onboarding of new staff.
*   **Experience**: RAG-powered chat, "Ask anything about protocols," discharge template management.

### 🤒 The Patient
*   **Need**: Clear, understandable discharge and follow-up instructions in their preferred language.
*   **Experience**: Bilingual WhatsApp summaries, Literacy-mapped instructions (Grade 6 level).

---

## 4. Feature Set (MoSCoW)

### 🥇 Must-Have
- **Real-time Streaming Whisper**: Low latency transcription (≤800ms).
- **SOAP Note Structuring**: Automated subjective/objective/assessment/plan generation.
- **DHA/HAAD Compliance Gate**: Mandatory doctor approval before any PHI is finalized or exported.
- **RAG Engine (Dify/pgvector)**: Knowledge retrieval with high precision@5 (≥0.82).
- **Bilingual Layout**: Arabic (RTL) and English (LTR) full support.

### 🥈 Should-Have
- **ICD-10/CPT Mapping**: Automated billing code suggestion with confidence scores.
- **WhatsApp Integration**: Automated follow-up dispatch.
- **3D Anatomy Interaction**: (R3F) for interactive onboarding.
- **Multi-Tenancy (RLS)**: Zero cross-talk between different clinic data.

### 🥉 Could-Have
- **Voice Bio-authentication**: Verify the doctor's identity via voice print.
- **Insurance Denial Prediction**: Based on clinical note quality.

---

## 5. Compliance & Security (DHA / HAAD / NMC)

- **Audit Trail**: Every AI-generated claim is hash-linked to a specific doctor's approval.
- **PHI Masking**: Raw audio is deleted post-transcription unless explicit "Learning Consent" is provided.
- **Human-in-the-Loop**: Zero-tolerance for fully autonomous clinical note finalization.
- **Regional Data Residency**: Data stored in UAE West (DHA) or equivalent regional clouds.

---

## 6. Technical Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Database**: Supabase (PostgreSQL, pgvector, Edge Functions)
- **AI Models**: OpenAI Whisper (Speech-to-Text), GPT-4o (Reasoning & Structuring)
- **Embeddings**: text-embedding-3-large (Namespace-aware for AR/EN)
- **Design**: Tailwind CSS, GSAP (Motion), React Three Fiber (3D)

---

## 7. Key Performance Indicators (KPIs)
| Metric | Target |
|---|---|
| **Transcription WER** | ≤ 5% (Medical Specific) |
| **Structuring Accuracy** | ≥ 90% sections correct |
| **Retrieval Precision** | ≥ 0.82 (P@5) |
| **Time Saved** | ~3.5 hours per doctor/day |
| **Response Time (RAG)** | ≤ 2.0 seconds |

---

## 8. Screen Inventory Summary
1.  **Scribe (5 screens)**: Start, Live, Review, Billing, History.
2.  **HelpDoc (5 screens)**: Knowledge Home, Article View, Chat, Patient Portal, Admin.
3.  **Core (3 screens)**: Dashboard, Onboarding (3D Hero), Settings.

---
*Created by ScribeAI Agent Team.*
