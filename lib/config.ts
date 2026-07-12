import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  ML_SERVICE_URL: z.string().url().default("http://localhost:8000"),
  ML_INTERNAL_TOKEN: z.string().min(16).optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_TEMPLATE_NAME: z.string().default("fleetpulse_alert")
});
export const config = configSchema.parse(process.env);
export function assertProductionConfig() {
  if (config.NODE_ENV !== "production") return;
  const missing = [!config.NEXTAUTH_SECRET && "NEXTAUTH_SECRET", !config.ML_INTERNAL_TOKEN && "ML_INTERNAL_TOKEN"].filter(Boolean);
  if (missing.length) throw new Error(`Missing production secrets: ${missing.join(", ")}`);
}
