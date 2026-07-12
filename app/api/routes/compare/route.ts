import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  origin: z.object({ latitude: z.number().min(6).max(38), longitude: z.number().min(68).max(98) }),
  destination: z.object({ latitude: z.number().min(6).max(38), longitude: z.number().min(68).max(98) }),
});

export async function POST(request: Request) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const key = process.env.GOOGLE_ROUTES_API_KEY;
  if (!key || key.startsWith("REPLACE_")) return NextResponse.json({ error: "Routes API key is not configured" }, { status: 503 });
  const waypoint = (p: { latitude: number; longitude: number }) => ({ location: { latLng: p } });
  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.routeLabels" },
    body: JSON.stringify({ origin: waypoint(parsed.data.origin), destination: waypoint(parsed.data.destination), travelMode: "DRIVE", routingPreference: "TRAFFIC_AWARE", computeAlternativeRoutes: true, languageCode: "en-IN", units: "METRIC" }),
    cache: "no-store",
  });
  if (!response.ok) {
    const failure = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    return NextResponse.json({ error: failure?.error?.message || "Google Routes request failed", status: response.status }, { status: 502 });
  }
  const data = await response.json() as { routes?: Array<{ distanceMeters: number; duration: string; polyline?: { encodedPolyline: string } }> };
  const routes = (data.routes || []).map((route, index) => {
    const km = route.distanceMeters / 1000; const minutes = Math.round(Number(route.duration.replace("s", "")) / 60); const litres = km / 4.8;
    return { id: index, distanceKm: Number(km.toFixed(1)), durationMinutes: minutes, estimatedLitres: Number(litres.toFixed(1)), estimatedFuelCostInr: Math.round(litres * 94), polyline: route.polyline?.encodedPolyline };
  });
  return NextResponse.json({ routes, recommended: routes.length ? routes.reduce((best, item) => item.estimatedFuelCostInr < best.estimatedFuelCostInr ? item : best) : null });
}
