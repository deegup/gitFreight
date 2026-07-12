"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import LiveFleetMap from "./live-fleet-map";

type Vehicle = { registration: string; route: string; status: string; score: number; efficiency: string; latitude: number; longitude: number; speed?: number };
type RouteResult = { id: number; distanceKm: number; durationMinutes: number; estimatedLitres: number; estimatedFuelCostInr: number };
const initialFleet: Vehicle[] = [
  { registration: "MH 12 AB 4821", route: "Pune → Mumbai", status: "ON_ROUTE", score: 68, efficiency: "4.21 km/L", latitude: 18.5204, longitude: 73.8567 },
  { registration: "KA 01 MN 7712", route: "Bengaluru → Chennai", status: "ON_ROUTE", score: 91, efficiency: "5.12 km/L", latitude: 12.9716, longitude: 77.5946 },
  { registration: "RJ 14 GT 9067", route: "Jaipur → Delhi", status: "IDLE", score: 72, efficiency: "4.43 km/L", latitude: 26.9124, longitude: 75.7873 },
  { registration: "DL 01 TR 2398", route: "Delhi → Lucknow", status: "ON_ROUTE", score: 88, efficiency: "4.94 km/L", latitude: 28.6139, longitude: 77.209 },
];

export default function DashboardClient({ mapsKey, socketToken, userName, userImage, signOutAction }: { mapsKey: string; socketToken: string; userName: string; userImage?: string; signOutAction: () => Promise<void> }) {
  const [events, setEvents] = useState(["Live connection ready — authenticated pilot workspace"]); const [connected, setConnected] = useState(false); const [fleet, setFleet] = useState(initialFleet);
  const [routes, setRoutes] = useState<RouteResult[]>([]); const [routeError, setRouteError] = useState(""); const [optimizing, setOptimizing] = useState(false);
  useEffect(() => {
    const socket = io({ path: "/socket.io", auth: { token: socketToken } });
    socket.on("connect", () => setConnected(true)); socket.on("disconnect", () => setConnected(false));
    socket.on("vehicle:update", (v: { registration: string; latitude: number; longitude: number; speed: number; status: string }) => setFleet(current => current.map(item => item.registration === v.registration ? { ...item, ...v } : item)));
    socket.on("alert:new", (a: { title: string; detail: string }) => setEvents(x => [`${a.title}: ${a.detail}`, ...x].slice(0, 4)));
    return () => { socket.close(); };
  }, [socketToken]);
  async function compareRoutes() {
    setOptimizing(true); setRouteError("");
    try { const response = await fetch("/api/routes/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origin: { latitude: 18.5204, longitude: 73.8567 }, destination: { latitude: 19.076, longitude: 72.8777 } }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Route comparison failed"); setRoutes(data.routes || []); }
    catch (error) { setRouteError(error instanceof Error ? error.message : "Route comparison failed"); } finally { setOptimizing(false); }
  }
  return <main className="app">
    <aside><div className="brand"><span>◉</span> FleetPulse</div><small>WORKSPACE</small><nav><a className="active" href="#overview">▦ Overview</a><a href="#fleet">▣ Live Fleet</a><a href="#routes">⌁ Routes</a><a href="#fuel">◉ Fuel Analytics</a><a href="#drivers">♙ Drivers</a><a href="#maintenance">◎ Maintenance</a></nav><div className="whatsapp"><b>WhatsApp alerts</b><p>Provider-ready route and fuel notifications.</p><button>Configure alerts</button></div></aside>
    <section className="content"><header><div><h1>Good morning, {userName.split(" ")[0]}</h1><p>Your authenticated fleet workspace is live.</p></div><div className="account"><span className={connected ? "live" : "offline"}>● {connected ? "Live" : "Reconnecting"}</span>{userImage ? <img src={userImage} alt="Profile" /> : <span className="avatar">{userName.slice(0,2).toUpperCase()}</span>}<form action={signOutAction}><button className="signout">Sign out</button></form></div></header>
      <article id="overview" className="hero"><div><small>FUEL EFFICIENCY OPPORTUNITY</small><h2>₹1,24,800 can be saved this month</h2><p>Based on idling, route deviations, and driver behaviour across your active fleet.</p></div><div><span>Potential diesel saved</span><strong>1,152 L</strong><span>Equivalent to 3.4% fleet improvement</span></div></article>
      <div className="kpis">{[["Active vehicles","84 / 96","↑ 6% vs last week"],["Fuel efficiency","4.82 km/L","↑ 0.21 vs last week"],["Idle time","7.4 hrs","1.2 hrs needs attention"],["On-time delivery","93.6%","↑ 2.8% vs last week"]].map(([a,b,c]) => <article className="card" key={a}><small>{a}</small><strong>{b}</strong><em>{c}</em></article>)}</div>
      <div className="grid"><article id="fleet" className="card map-card"><div className="card-head"><div><h3>Live fleet</h3><p>Vehicle locations update through authenticated sockets.</p></div><span>{fleet.filter(v => v.status === "ON_ROUTE").length} on route</span></div><LiveFleetMap apiKey={mapsKey} vehicles={fleet} /></article><article className="card alerts"><h3>Priority alerts</h3>{events.map((e,i)=><p key={`${e}-${i}`}><b>{i===0?"● ":"○ "}</b>{e}</p>)}</article></div>
      <div className="grid"><article className="card table"><h3>Fleet at a glance</h3><table><thead><tr><th>Vehicle</th><th>Current route</th><th>Status</th><th>Driver score</th><th>Efficiency</th></tr></thead><tbody>{fleet.map(v=><tr key={v.registration}><td><b>{v.registration}</b></td><td>{v.route}</td><td><span className={`status-pill ${v.status.toLowerCase()}`}>{v.status.replace("_"," ")}</span></td><td>{v.score}</td><td>{v.efficiency}</td></tr>)}</tbody></table></article><article id="routes" className="card action"><h3>Pune → Mumbai route</h3><p>Compare live traffic-aware alternatives and rank them by estimated diesel cost.</p><button onClick={compareRoutes} disabled={optimizing}>{optimizing ? "Comparing routes…" : "Compare with Google Routes"}</button>{routeError && <p className="error">{routeError}</p>}{routes.map((r,i)=><div className="route-result" key={r.id}><b>{i===0?"Recommended":"Alternative"}</b><span>{r.distanceKm} km · {r.durationMinutes} min</span><strong>₹{r.estimatedFuelCostInr}</strong><small>{r.estimatedLitres} L estimated</small></div>)}</article></div>
    </section>
  </main>;
}
