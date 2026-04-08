import operator
from typing import Annotated, Sequence, TypedDict

from langgraph.graph import StateGraph, END

# Define the state of our gap-filling agent
class AgentState(TypedDict):
    cancellation_slot: str
    candidates: Annotated[Sequence[dict], operator.add]
    selected_patient: dict
    status: str

# 1. SCOUT PHASE: Identify Waitlist Candidates
def scout_candidates(state: AgentState):
    print(f"Scouting candidates for slot: {state['cancellation_slot']}")
    # Mock database lookup for waitlist
    mock_waitlist = [
        {"id": "p1", "name": "Alice Smith", "pain_score": 8, "time_on_waitlist": 12},
        {"id": "p2", "name": "Bob Jones", "pain_score": 4, "time_on_waitlist": 25},
        {"id": "p3", "name": "Charlie Day", "pain_score": 9, "time_on_waitlist": 2},
    ]
    return {"candidates": mock_waitlist, "status": "SCOUTED"}

# 2. EVALUATOR PHASE: Score candidates based on clinical priority and wait time
def evaluate_candidates(state: AgentState):
    print("Evaluating candidates based on clinical priority...")
    # Score = (Pain Score * 0.7) + (Wait Time * 0.3)
    scored = sorted(state['candidates'], key=lambda x: (x['pain_score'] * 0.7) + (x['time_on_waitlist'] * 0.3), reverse=True)
    return {"selected_patient": scored[0], "status": "EVALUATED"}

# 3. TRIGGER PHASE: Send automated WhatsApp offer
def trigger_offer(state: AgentState):
    patient = state['selected_patient']
    print(f"Triggering WhatsApp offer to {patient['name']} for slot {state['cancellation_slot']}...")
    return {"status": "OFFERED"}

# Initialize Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("scout", scout_candidates)
workflow.add_node("evaluate", evaluate_candidates)
workflow.add_node("trigger", trigger_offer)

# Define Edges
workflow.set_entry_point("scout")
workflow.add_edge("scout", "evaluate")
workflow.add_edge("evaluate", "trigger")
workflow.add_edge("trigger", END)

# Compile
gap_filler = workflow.compile()

def fill_gap(slot_id: str):
    print(f"Cliniq OS: Detected cancellation in slot {slot_id}. Initializing recovery flow...")
    initial_state = {"cancellation_slot": slot_id, "candidates": [], "selected_patient": {}, "status": "INIT"}
    final_output = gap_filler.invoke(initial_state)
    return final_output

if __name__ == "__main__":
    fill_gap("slot-123-2026-04-06")
