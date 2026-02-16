"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useMapEvents } from "react-leaflet";

/* ---------------------------------------------
 * Dynamic imports (NO SSR)
 * -------------------------------------------- */
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

/* ---------------------------------------------
 * Click handler (SAFE)
 * -------------------------------------------- */
function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/* ---------------------------------------------
 * Component
 * -------------------------------------------- */
export default function AdminMapPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  /* ✅ Load Leaflet ONLY on client */
  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    })();
  }, []);

  const center: [number, number] =
    latitude && longitude
      ? [latitude, longitude]
      : [10.0, 118.7]; // Palawan default

  return (
    <div className="h-[260px] sm:h-[320px] lg:h-[380px] rounded-xl overflow-hidden border">


      <MapContainer center={center} zoom={6} className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onPick={onChange} />

        {latitude && longitude && (
          <Marker
            position={[latitude, longitude]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const pos = e.target.getLatLng();
                onChange(pos.lat, pos.lng);
              },
            }}
          >
            <Popup>Click map or drag marker</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
