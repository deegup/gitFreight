import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { assertProductionConfig, config } from "./lib/config";
import { verifySocketToken } from "./lib/socket-token";

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handler = app.getRequestHandler();
app.prepare().then(() => {
  assertProductionConfig();
  const server = createServer(handler);
  const io = new Server(server, { path: "/socket.io", cors: { origin: config.NEXTAUTH_URL || "http://localhost:3000", credentials: true }, transports: ["websocket", "polling"] });
  io.use((socket, next) => {
    const identity = verifySocketToken(socket.handshake.auth?.token);
    if (!identity) return next(new Error("unauthorized"));
    socket.data.organizationId = identity.organizationId;
    next();
  });
  io.on("connection", socket => {
    const org = socket.data.organizationId as string;
    socket.join(`org:${org}`);
  });
  (globalThis as typeof globalThis & { fleetIo?: Server }).fleetIo = io;
  server.listen(Number(process.env.PORT || 3000), () => console.log("FleetPulse ready at http://localhost:3000"));
});
