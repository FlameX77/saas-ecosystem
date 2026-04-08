# Novu AI Reactivation: Clinical Master Scripts & Mechanism

This document defines the specialized "High-Empathy Clinical Precision" scripts and the outreach mechanism I have implemented for the Novu Patient Reactivation Engine.

## 1. The Reactivation Mechanism (The "Novu Caller" Logic)
The system is built as a **Multi-Touch Sequence** that prioritizes non-intrusive contact before escalating to high-conversion AI voice calls.

1.  **Touch 1: WhatsApp (T+0)** — Personalized clinical check-in.
2.  **Touch 2: SMS Reminder (T+24h)** — Appointment interest ping.
3.  **Touch 3: AI Voice Call (T+48h)** — Autonomous booking agent calls to discuss clinical necessity and availability.

---

## 2. Personalized WhatsApp Scripts (The "Check-In" Phase)

### Pattern: The "Clinical Recall"
**Constraint:** Must reference specific visit info (e.g., "Physiotherapy follow-up" or "Annual Dental Cleaning").

> "Hi [Patient_Name], this is [Clinic_Name]'s patient care team. We noticed it's been [Time_Since] since your last [Treatment_Type] visit with Dr. [Doctor_Name]. Consistency is key for your [Recovery/Goal]. Would you like to check the schedule for a follow-up this week?"

---

## 3. AI Voice Caller Script (The "Closer")
**Model:** Low-Latency, High-Empathy (e.g., ElevenLabs + Vapi)
**Tone:** Warm, professional, helpful. **NEVER RUSHED.**

### [AGENT PROMPT / SCRIPT]
"Hello [Patient_Name], I'm [Agent_Name] calling from [Clinic_Name]. How are you today? 
[Wait for response]

I'm following up because Dr. [Doctor_Name] was reviewing your file from your last visit regarding [Last_Diagnosis/Reason]. We haven't seen you back for your recommended [Follow_up_Procedure]. 

It's important that we stay on top of this to prevent [Possible_Clinical_Risk]. I have an opening this Thursday at 10 AM or Friday at 2 PM. Which of those works better for you to get this booked in?"

### Handling Objections:
- **"I'm busy":** "I understand. I can actually book you in for a month from now instead to secure the slot. Would that give you enough breathing room?"
- **"Not interested":** "Understood. I'll update your file. Is there any specific reason you'd like us to pause follow-ups so I can let the doctor know?"

---

## 4. n8n Integration Logic
I have mapped these scripts into the `novu-reactivation-master.json` workflow. 
- **Tool:** OpenAI (Script Personalization)
- **Tool:** WhatsApp Business API
- **Tool:** Vapi (AI Voice Agent)
- **Database:** Supabase (Logging attempts and interest level)

> [!IMPORTANT]
> This system is designed to handle **unattended** or **lost** patients provided by hospital exports, turning them back into active appointments. 
