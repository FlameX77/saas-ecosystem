import os
import random
from crewai import Agent, Task, Crew, Process

# Mock ElevenLabs and Twilio for demonstration
# In production, this would use the ElevenLabs and Twilio SDKs
class VoiceAgent:
    def call(self, patient_phone: str, script: str):
        print(f"Calling {patient_phone} with script: {script}")
        return "Call Result: Patient picked up, interested in rebooking."

# 1. SCOUT AGENT: Candidate Scoring
scout = Agent(
    role='Patient Recovery Scout',
    goal='Identify and prioritze lapsed patients for clinical reactivation.',
    backstory='You are a healthcare data analyst who identifies patients who have missed follow-ups or haven't booked in 60+ days.',
    verbose=True,
    allow_delegation=False,
    memory=True
)

# 2. CALLER AGENT: Voice Engagement
caller = Agent(
    role='Clinic Outreach Specialist',
    goal='Execute high-empathy voice calls to reactivate lapsed patients.',
    backstory='You are a professional medical admin assistant with a warm, empathetic tone powered by ElevenLabs voice synthesis.',
    verbose=True,
    allow_delegation=False,
    memory=True
)

# 3. TRACKER AGENT: Success Metrics
tracker = Agent(
    role='Revenue Recovery Auditor',
    goal='Track the outcomes of all outreach and calculate recovered revenue.',
    backstory='You provide the clinic owner with clear ROI on every reactivation campaign launched.',
    verbose=True,
    allow_delegation=True,
    memory=True
)

# Define Tasks
scout_task = Task(
    description='Analyze the patient database to identify 10 priority candidates for reactivation based on diagnosis and time lapsed.',
    expected_output='A prioritized list of 10 patients with their ID, contact info, and "Reactivation Likelihood Score" (1-100).',
    agent=scout
)

call_task = Task(
    description='Perform outreach calls for the top 10 candidates. Handle objections regarding scheduling and cost.',
    expected_output='A call log for each patient, including the outcome (Booked, Pending, Refused).',
    agent=caller
)

report_task = Task(
    description='Compile a final campaign performance report. Include "Estimated Recovered Revenue" based on average specialty visit value ($150).',
    expected_output='A professional PDF-ready report summarizing the success of the reactivation campaign.',
    agent=tracker
)

# Create the Crew
reactivation_crew = Crew(
    agents=[scout, caller, tracker],
    tasks=[scout_task, call_task, report_task],
    process=Process.sequential,
    verbose=True
)

def run_campaign():
    # In production, this is triggered from the Cliniq OS Dashboard
    result = reactivation_crew.kickoff()
    return result

if __name__ == "__main__":
    print("Cliniq OS: Launching Patient Reactivation Crew...")
    run_campaign()
