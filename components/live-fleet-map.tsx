"use client";
import { useEffect, useRef } from "react";

type VehiclePoint = { registration: string; latitude: number; longitude: number; status: string };
declare global { interface Window { google?: { maps: { Map: new (node: HTMLElement, options: unknown) => { setCenter: (p: unknown) => void }; Marker: new (options: unknown) => unknown } } } }

export default function LiveFleetMap({ apiKey, vehicles }: { apiKey: string; vehicles: VehiclePoint[] }) {
  const node = useRef<HTMLDivElement>(null); const map = useRef<{ setCenter: (p: unknown) => void } | null>(null); const markers = useRef<unknown[]>([]);
  useEffect(() => {
    if (!apiKey || apiKey.startsWith("REPLACE_") || !node.current) return;
    const render = () => {
      if (!node.current || !window.google) return;
      map.current = new window.google.maps.Map(node.current, { center: { lat: 22.5, lng: 79 }, zoom: 5, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
      markers.current = vehicles.map(v => new window.google!.maps.Marker({ map: map.current, position: { lat: v.latitude, lng: v.longitude }, title: `${v.registration} · ${v.status}` }));
    };
    if (window.google) return render();
    const existing = document.querySelector<HTMLScriptElement>("script[data-fleetpulse-maps]");
    if (existing) { existing.addEventListener("load", render); return () => existing.removeEventListener("load", render); }
    const script = document.createElement("script"); script.dataset.fleetpulseMaps = "true"; script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`; script.async = true; script.onload = render; document.head.appendChild(script);
  }, [apiKey]);
  useEffect(() => { if (!map.current || !window.google) return; markers.current = vehicles.map(v => new window.google!.maps.Marker({ map: map.current, position: { lat: v.latitude, lng: v.longitude }, title: `${v.registration} · ${v.status}` })); }, [vehicles]);
  if (!apiKey || apiKey.startsWith("REPLACE_")) return <div className="map-placeholder">Add a valid Maps JavaScript API key to show the live fleet map.</div>;
  return <div ref={node} className="fleet-map" aria-label="Live fleet map" />;
}
