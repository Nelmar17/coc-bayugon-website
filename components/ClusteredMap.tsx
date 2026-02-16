"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";

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

export default function ClusteredMap({ items }: { items: any[] }) {
  return (
    <div className="h-[450px] rounded-xl overflow-hidden shadow">
      <MapContainer center={[10, 118.7]} zoom={6} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MarkerClusterGroup>
          {items.map(
            (i) =>
              i.latitude &&
              i.longitude && (
                <Marker key={i.id} position={[i.latitude, i.longitude]}>
                  <Popup>
                    <strong>{i.congregationName}</strong>
                    <br />
                    {i.location}
                  </Popup>
                </Marker>
              )
          )}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
