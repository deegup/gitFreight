import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ service: "fleetpulse", status: "ok", database: "connected", realtime: true });
  } catch {
    return NextResponse.json({ service: "fleetpulse", status: "degraded", database: "unavailable", realtime: true }, { status: 503 });
  }
}
