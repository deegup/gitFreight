import { AlertType, VehicleStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./prisma";

export const telemetrySchema = z.object({
  apiKey: z.string().min(12), timestamp: z.coerce.date(), latitude: z.number().min(6).max(38), longitude: z.number().min(68).max(98),
  speed: z.number().min(0).max(180), ignition: z.boolean(), odometer: z.number().nonnegative(), fuelLevel: z.number().min(0).max(100).optional(),
  harshBraking: z.number().int().min(0).max(20).default(0), harshAcceleration: z.number().int().min(0).max(20).default(0), overspeed: z.boolean().default(false)
});

export async function ingestTelemetry(input: z.infer<typeof telemetrySchema>) {
  const vehicle = await prisma.vehicle.findUnique({ where: { apiKey: input.apiKey }, include: { organization: true } });
  if (!vehicle) throw new Error("Unknown device key");
  const { apiKey: _apiKey, ...telemetry } = input;
  const point = await prisma.telemetry.create({ data: { vehicleId: vehicle.id, ...telemetry } });
  const status = input.ignition ? (input.speed < 3 ? VehicleStatus.IDLE : VehicleStatus.ON_ROUTE) : VehicleStatus.OFFLINE;
  await prisma.vehicle.update({ where: { id: vehicle.id }, data: { status, odometer: input.odometer, fuelLevel: input.fuelLevel } });
  const alerts: { type: AlertType; title: string; detail: string; confidence: number }[] = [];
  if (input.ignition && input.speed < 3) alerts.push({ type: AlertType.EXCESS_IDLE, title: "Excess idle time", detail: `${vehicle.registration} is idling; check driver status.`, confidence: .78 });
  if (input.overspeed || input.harshBraking >= 4) alerts.push({ type: AlertType.FUEL_ANOMALY, title: "Driver behaviour risk", detail: `${vehicle.registration} shows fuel-impacting driving behaviour.`, confidence: .74 });
  const created = await Promise.all(alerts.map(a => prisma.alert.create({ data: { organizationId: vehicle.organizationId, vehicleId: vehicle.id, ...a, featureSnapshot: input } })));
  const io = (globalThis as typeof globalThis & { fleetIo?: { to: (room: string) => { emit: (event: string, payload: unknown) => void } } }).fleetIo;
  io?.to(`org:${vehicle.organizationId}`).emit("vehicle:update", { id: vehicle.id, registration: vehicle.registration, latitude: input.latitude, longitude: input.longitude, speed: input.speed, status });
  created.forEach(alert => io?.to(`org:${vehicle.organizationId}`).emit("alert:new", alert));
  return { point, alerts: created, vehicle: { id: vehicle.id, registration: vehicle.registration, status } };
}
