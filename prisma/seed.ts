import { PrismaClient, VehicleStatus, AlertType } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const org = await db.organization.upsert({ where: { id: "demo-org" }, update: {}, create: { id: "demo-org", name: "Aarav Logistics" } });
  const driver = await db.driver.upsert({ where: { id: "driver-arjun" }, update: {}, create: { id: "driver-arjun", organizationId: org.id, name: "Arjun Kumar", phone: "+919876543210", score: 87 } });
  const truck = await db.vehicle.upsert({ where: { registration: "MH 12 AB 4821" }, update: {}, create: { organizationId: org.id, registration: "MH 12 AB 4821", make: "Tata", model: "Prima", status: VehicleStatus.ON_ROUTE, odometer: 85420, fuelLevel: 61, apiKey: "demo-device-key", driverId: driver.id } });
  await db.telemetry.create({ data: { vehicleId: truck.id, timestamp: new Date(), latitude: 18.5204, longitude: 73.8567, speed: 54, ignition: true, odometer: 85420, fuelLevel: 61 } });
  await db.alert.create({ data: { organizationId: org.id, vehicleId: truck.id, type: AlertType.FUEL_ANOMALY, title: "Fuel anomaly detected", detail: "MH 12 AB 4821 is consuming 18% above expected.", confidence: .88 } });
  await db.recommendation.create({ data: { organizationId: org.id, vehicleId: truck.id, title: "Optimize NH48 route", detail: "Reroute three vehicles around congestion before dispatch.", savingsInr: 8460, confidence: .81, modelVersion: "baseline-1.0", featureSnapshot: { dieselLitres: 94 } } });
}
main().finally(() => db.$disconnect());
