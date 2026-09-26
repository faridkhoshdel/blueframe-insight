"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/lib/ThemeContext";

const LeafletMap = dynamic(() => import("./LeafletMapInner"), { ssr: false });

export interface MapStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order: number;
  notes?: string;
}

export default function RouteMap({ stops, routeName }: { stops: MapStop[]; routeName?: string }) {
  const { theme } = useTheme();

  useEffect(() => {
    // لود CSS leaflet در کلاینت
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  if (!stops || stops.length === 0) {
    return (
      <div className="theme-card text-center py-12">
        <div className="text-4xl mb-3">🗺️</div>
        <p style={{ color: "var(--text-secondary)" }}>برای این مسیر توقفی ثبت نشده</p>
      </div>
    );
  }

  return (
    <div className="theme-card" style={{ padding: 0, overflow: "hidden" }}>
      {routeName && (
        <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
          <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>🗺️ {routeName}</h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {stops.length} توقف • مسافت تقریبی محاسبه می‌شود
          </p>
        </div>
      )}
      <LeafletMap stops={stops} darkMode={theme === "dark"} />
    </div>
  );
}
