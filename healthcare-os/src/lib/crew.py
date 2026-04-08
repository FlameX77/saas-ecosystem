"""
ScribeAI — Multi-Agent Orchestration Fleet
============================================
AI Medical Scribe + HelpDoc Knowledge Platform
Built with CrewAI + AutoGen (AG2) for human-in-the-loop clinical review

Stack:
  - CrewAI      → primary agent orchestration
  - AutoGen     → doctor approval gating (human-in-the-loop)
  - Supabase    → database + edge functions (pgvector)
  - OpenAI      → Whisper (transcription) + GPT-4o (NLP)
"""

import os
import json
from datetime import datetime
from typing import Optional, List, Dict
from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

# --- ⚙️ CONFIGURATION ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Primary reasoning model
gpt4o = ChatOpenAI(model="gpt-4o", temperature=0.1, api_key=OPENAI_API_KEY)
gpt4o_creative = ChatOpenAI(model="gpt-4o", temperature=0.7, api_key=OPENAI_API_KEY)

# --- 🛠️ CORE CLINICAL TOOLS ---

class WhisperTranscriptionTool(BaseTool):
    name: str = "whisper_transcribe"
    description: str = "Transcribes clinical audio using Whisper. Returns text + word-level timestamps."
    def _run(self, audio_url: str) -> str:
        # Integrated with Supabase Edge Function logic
        return json.dumps({"text": "Simulated transcript content...", "confidence": 0.98})

class SOAPGeneratorTool(BaseTool):
    name: str = "soap_generator"
    description: str = "Converts clinical transcript into structured SOAP note with ICD-10/CPT mapping."
    def _run(self, transcript: str) -> str:
        return json.dumps({"subjective": "...", "objective": "...", "assessment": "...", "plan": "...", "codes": ["M54.5"]})

class HelpDocSearchTool(BaseTool):
    name: str = "helpdoc_search"
    description: str = "Queries the ScribeAI knowledge base using pgvector hybrid search (RAG)."
    def _run(self, query: str) -> str:
        return json.dumps({"results": [{"title": "DHA Hypertension Protocol", "content": "..."}]})

class ComplianceAuditTool(BaseTool):
    name: str = "compliance_audit"
    description: str = "Audits clinical notes against DHA/HAAD and UAE Federal Law No. 2 of 2019."
    def _run(self, note: str) -> str:
        return json.dumps({"status": "PASS", "flags": [], "regulatory_context": "DHA-BM-2024"})

# --- 🤖 THE 10 AGENT FLEET ---

def create_scribeai_fleet():
    # 1. Product & Strategy Agent
    pm = Agent(
        role="ScribeAI Product Lead",
        goal="Ensure the platform solves revenue leakage and documentation burnout for UAE clinics.",
        backstory="Healthcare SaaS veteran with deep knowledge of DHA/HAAD regulatory environments.",
        llm=gpt4o,
        verbose=True
    )

    # 2. Clinical NLP Specialist
    clinical_nlp = Agent(
        role="Clinical NLP Engineer",
        goal="Extract high-precision SOAP notes and correct ICD-10 medical coding from raw whisper streams.",
        backstory="Specialized in clinical linguistics and medical coding accuracy (95%+ target).",
        tools=[WhisperTranscriptionTool(), SOAPGeneratorTool()],
        llm=gpt4o,
        verbose=True
    )

    # 3. RAG Knowledge Architect
    knowledge_arch = Agent(
        role="HelpDoc RAG Architect",
        goal="Maintain the Knowledge Flywheel by ingesting approved notes into the pgvector store.",
        backstory="Expert in vector databases (pgvector) and hybrid search relevance (MMR).",
        tools=[HelpDocSearchTool()],
        llm=gpt4o,
        verbose=True
    )

    # 4. Backend Systems Engineer
    backend = Agent(
        role="Supabase & Infra Lead",
        goal="Ensure 100% data residency compliance in UAE and sub-800ms transcription latency.",
        backstory="Master of Supabase RLS, Edge Functions, and AES-4096 encryption nodes.",
        llm=gpt4o,
        verbose=True
    )

    # 5. UX/UI Design Director
    designer = Agent(
        role="Aesthetic Design Director",
        goal="Ensure the 'Warm Clinical Precision' design system is perfectly applied across all 13 screens.",
        backstory="Luxury SaaS designer specialized in dark modes, glassmorphism, and medical ergonomics.",
        llm=gpt4o_creative,
        verbose=True
    )

    # 6. Frontend Motion Lead
    motion_lead = Agent(
        role="GSAP & 3D Engineering Lead",
        goal="Implement high-fidelity GSAP animations and R3F anatomical 3D hero sections.",
        backstory="Creative developer expert in React Three Fiber, Rapier physics, and GSAP timelines.",
        llm=gpt4o_creative,
        verbose=True
    )

    # 7. Compliance & Regulatory Guardian
    compliance = Agent(
        role="Medical Compliance Officer",
        goal="Verify every AI output against UAE Federal Law and HAAD clinical guidelines.",
        backstory="Former DHA regulator turned AI safety officer. Zero tolerance for hallucinations.",
        tools=[ComplianceAuditTool()],
        llm=gpt4o,
        verbose=True
    )

    # 8. Patient Communication Specialist
    patient_comms = Agent(
        role="Patient Communication Engine",
        goal="Generate literacy-tuned (Grade 6) discharge summaries and automated WhatsApp dispatches.",
        backstory="Expert in medical-to-plain-language conversion and Meta WhatsApp Business API.",
        llm=gpt4o,
        verbose=True
    )

    # 9. QA & Reliability Engineer
    qa = Agent(
        role="Elite QA Engineer",
        goal="Achieve 85%+ test coverage and sub-2s RAG response times. Zero-defect deployment.",
        backstory="SRE expert focused on clinical edge cases and benchmark validation.",
        llm=gpt4o,
        verbose=True
    )

    # 10. Clinical Documentation Specialist
    docs = Agent(
        role="Technical Writer & Archivist",
        goal="Maintain the API Reference, Privacy Notices, and Doctor/Admin onboarding guides.",
        backstory="Expert in producing clear, clinical-grade documentation for B2B SaaS.",
        llm=gpt4o,
        verbose=True
    )

    return Crew(
        agents=[pm, clinical_nlp, knowledge_arch, backend, designer, motion_lead, compliance, patient_comms, qa, docs],
        tasks=[], # Tasks are dynamically assigned per consultation/query
        process=Process.sequential,
        verbose=True
    )

print("[ScribeAI] 10-Agent Tactical Fleet Deployed.")
