import os
from datetime import datetime
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="FleetPulse ML", version="1.0.0")
TOKEN = os.getenv("ML_INTERNAL_TOKEN", "replace-me")

class TelemetryFeatures(BaseModel):
    speed: float = Field(ge=0, le=180)
    fuel_level: float | None = Field(default=None, ge=0, le=100)
    expected_kmpl: float = Field(default=4.8, gt=0)
    actual_kmpl: float = Field(default=4.8, gt=0)
    idle_minutes: float = Field(default=0, ge=0)
    harsh_braking: int = Field(default=0, ge=0)
    harsh_acceleration: int = Field(default=0, ge=0)
    overspeed_events: int = Field(default=0, ge=0)
    odometer: float = Field(default=0, ge=0)
    kilometers_since_service: float = Field(default=0, ge=0)

def guard(token: str | None):
    if token != TOKEN: raise HTTPException(401, "Invalid internal token")

@app.get("/health")
def health(): return {"status": "ok", "models": ["fuel-anomaly", "driver-risk", "maintenance-risk"]}

@app.post("/v1/infer")
def infer(features: TelemetryFeatures, x_internal_token: str | None = Header(default=None)):
    guard(x_internal_token)
    consumption_gap = max(0, (features.expected_kmpl - features.actual_kmpl) / features.expected_kmpl)
    anomaly = min(.99, .12 + consumption_gap * 2 + (features.idle_minutes / 300))
    driver_risk = min(100, round(features.idle_minutes * .08 + features.harsh_braking * 6 + features.harsh_acceleration * 4 + features.overspeed_events * 9))
    maintenance = min(.99, .05 + features.kilometers_since_service / 20000 + max(0, features.odometer - 200000) / 1000000)
    return {"modelVersion": "heuristic-fallback-1.0", "generatedAt": datetime.utcnow().isoformat(), "fuelAnomaly": {"confidence": round(anomaly, 3), "isAnomaly": anomaly >= .65, "factors": ["actual vs expected km/L", "idle minutes"]}, "driverRisk": {"score": driver_risk, "factors": ["idling", "harsh braking", "overspeeding"]}, "maintenanceRisk": {"confidence": round(maintenance, 3), "factors": ["kilometers since service", "odometer"]}}

@app.post("/v1/retrain")
def retrain(x_internal_token: str | None = Header(default=None)):
    guard(x_internal_token)
    return {"accepted": True, "schedule": "weekly", "message": "Training job queued; replace fallback with tenant-approved labelled data."}
