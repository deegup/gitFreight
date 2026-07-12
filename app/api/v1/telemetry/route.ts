import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ingestTelemetry, telemetrySchema } from "@/lib/telemetry";
import { allowRequest } from "@/lib/rate-limit";
export async function POST(request: NextRequest) {
  const rate = allowRequest(request.headers.get("x-forwarded-for") || "unknown");
  if (!rate.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { "Retry-After": String(Math.ceil((rate.resetAt - Date.now()) / 1000)) } });
  try { const payload = telemetrySchema.parse(await request.json()); return NextResponse.json(await ingestTelemetry(payload), { status: 201, headers: { "Cache-Control": "no-store", "X-RateLimit-Remaining": String(rate.remaining) } }); }
  catch (error) { const message = error instanceof ZodError ? error.flatten() : error instanceof Error ? error.message : "Invalid telemetry"; const status = error instanceof Error && error.message === "Unknown device key" ? 401 : 400; return NextResponse.json({ error: message }, { status }); }
}
