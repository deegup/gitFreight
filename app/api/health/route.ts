import { NextResponse } from "next/server";
export const GET = () => NextResponse.json({ service: "fleetpulse", status: "ok", realtime: true });
