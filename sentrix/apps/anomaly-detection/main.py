import time
import uuid
import random
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Any
import numpy as np
from sklearn.ensemble import IsolationForest

app = FastAPI(title="Sentrix Anomaly Detection", version="1.0.0")

# Mock Isolation Forest for demonstration
# In production, this would load a pre-trained model per AgentID
clf = IsolationForest(contamination=0.1)
# Create some dummy training data (x, y) = (tool_frequency, duration)
X = np.random.rand(100, 2)
clf.fit(X)

class AnomalyCheckRequest(BaseModel):
    agent_id: str
    tool_name: str
    args: Optional[Any] = None
    historical_count: int = 0
    duration_ms: float = 0.0

class AnomalyCheckResponse(BaseModel):
    is_anomaly: bool
    score: float
    reason: Optional[str] = None
    trace_id: str

@app.get("/health")
def health():
    return {"status": "UP", "engine": "SentrixPython/1.2"}

@app.post("/v1/anomaly/check", response_model=AnomalyCheckResponse)
async def check_anomaly(req: AnomalyCheckRequest):
    # 1. Feature Engineering: tool_frequency and duration
    # In practice, we'd query ClickHouse/Redis for actual frequency
    features = np.array([[req.historical_count / 100.0, req.duration_ms / 1000.0]])
    
    # 2. Predict Anomaly (-1 is anomaly, 1 is normal)
    prediction = clf.predict(features)
    score = clf.decision_function(features)
    
    is_anomaly = prediction[0] == -1
    
    # Random anomaly for demo if not statistically found
    if random.random() > 0.98:
        is_anomaly = True

    return AnomalyCheckResponse(
        is_anomaly=is_anomaly,
        score=float(score[0]),
        reason="Behavioral drift detected: tool frequency exceeds historical baseline." if is_anomaly else None,
        trace_id=f"ptr-{uuid.uuid4()}"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
