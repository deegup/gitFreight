import { config } from "./config";
export async function inferFleetRisk(features: Record<string, number>) {
  try { const response = await fetch(`${config.ML_SERVICE_URL}/v1/infer`, { method: "POST", headers: { "Content-Type": "application/json", "X-Internal-Token": config.ML_INTERNAL_TOKEN || "" }, body: JSON.stringify(features), signal: AbortSignal.timeout(3000) }); if (!response.ok) throw new Error("ML unavailable"); return await response.json(); }
  catch { return { modelVersion: "deterministic-fallback", fuelAnomaly: { confidence: 0, isAnomaly: false }, driverRisk: { score: 0 }, maintenanceRisk: { confidence: 0 } }; }
}
