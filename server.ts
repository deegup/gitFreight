import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { assertProductionConfig, config } from "./lib/config";

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handler = app.getRequestHandler();
app.prepare().then(() => {
  assertProductionConfig();
  const server = createServer(handler);
  const io = new Server(server, { path: "/socket.io", cors: { origin: config.NEXTAUTH_URL || "http://localhost:3000", credentials: true }, transports: ["websocket", "polling"] });
  io.on("connection", socket => {
    const org = socket.handshake.auth?.organizationId;
    if (typeof org !== "string" || !/^[a-zA-Z0-9_-]{3,64}$/.test(org)) return socket.disconnect(true);
    socket.join(`org:${org}`);
  });
  (globalThis as typeof globalThis & { fleetIo?: Server }).fleetIo = io;
  server.listen(Number(process.env.PORT || 3000), () => console.log("FleetPulse ready at http://localhost:3000"));
});
