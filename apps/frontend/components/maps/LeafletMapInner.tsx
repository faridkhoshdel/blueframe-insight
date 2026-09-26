"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, useMap, LayersControl,
} from "react-leaflet";
import L from "leaflet";
import type { MapStop } from "./RouteMap";

const { BaseLayer } = LayersControl;

const makeIcon = (color: string, label?: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
      <path fill="${color}" stroke="#fff" stroke-width="2" d="M18 2C9.7 2 3 8.7 3 17c0 11.25 15 29 15 29s15-17.75 15-29C33 8.7 26.3 2 18 2z"/>
      <circle cx="18" cy="17" r="8" fill="#fff"/>
      ${label ? `<text x="18" y="22" font-size="12" font-weight="bold" fill="${color}" text-anchor="middle" font-family="sans-serif">${label}</text>` : ""}
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "custom-marker",
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -40],
  });
};

const startIcon = makeIcon("#10b981", "۱");
const endIcon = makeIcon("#ef4444", "پ");
const midIcon = (n: number) => makeIcon("#0ea5e9", String(n));

function FitBounds({ stops }: { stops: MapStop[] }) {
  const map = useMap();
  useEffect(() => {
    if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], 14);
    } else if (stops.length > 1) {
      const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, stops]);
  return null;
}

export default function LeafletMapInner({ stops, darkMode }: { stops: MapStop[]; darkMode: boolean }) {
  const sorted = useMemo(() => [...stops].sort((a, b) => a.order - b.order), [stops]);
  const path = sorted.map((s) => [s.lat, s.lng] as [number, number]);
  const center: [number, number] = sorted.length > 0 ? [sorted[0].lat, sorted[0].lng] : [35.6892, 51.389];

  return (
    <div
      dir="ltr"
      className={darkMode ? "leaflet-dark-tiles" : ""}
      style={{ height: 500, width: "100%" }}
    >
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <LayersControl position="topright">
          <BaseLayer checked name="نقشه شهری (فارسی)">
            <TileLayer
              url="https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains={["0", "1", "2", "3"]}
              attribution="&copy; Google"
            />
          </BaseLayer>
          <BaseLayer name="ماهواره‌ای">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri"
            />
          </BaseLayer>
          <BaseLayer name="OpenStreetMap">
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
          </BaseLayer>
        </LayersControl>

        <FitBounds stops={sorted} />

        {sorted.map((s, i) => {
          const icon = i === 0 ? startIcon : i === sorted.length - 1 ? endIcon : midIcon(s.order);
          return (
            <Marker key={s.id} position={[s.lat, s.lng]} icon={icon}>
              <Popup>
                <div dir="rtl" style={{ fontSize: 13 }}>
                  <b>{s.name}</b>
                  <br />
                  <span>ترتیب: {s.order}</span>
                  {s.notes && <><br /><span>یادداشت: {s.notes}</span></>}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {path.length > 1 && (
          <Polyline positions={path} color="#0ea5e9" weight={4} dashArray="8 4" opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
}
