import { createHmac, timingSafeEqual } from "node:crypto";
const secret = () => process.env.NEXTAUTH_SECRET || "development-only-fleetpulse-secret";
export function createSocketToken(organizationId: string) {
  const payload = Buffer.from(JSON.stringify({ organizationId, expiresAt: Date.now() + 10 * 60_000 })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`;
}
export function verifySocketToken(token: unknown) {
  if (typeof token !== "string") return null;
  const [payload, signature] = token.split("."); if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(signature); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as { organizationId: string; expiresAt: number }; return parsed.expiresAt > Date.now() ? parsed : null; } catch { return null; }
}
