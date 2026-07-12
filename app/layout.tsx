import type { Metadata } from "next";
import "./styles.css";
export const metadata: Metadata = { title: "FleetPulse | Fleet Intelligence", description: "Real-time fuel optimization for Indian fleets" };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
