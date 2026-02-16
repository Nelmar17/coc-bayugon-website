"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";


function FitBounds({ items }: { items: DirectoryItem[] }) {
  const map = useMap();

  useEffect(() => {
    const points = items
      .filter((i) => i.latitude && i.longitude)
      .map((i) => [i.latitude!, i.longitude!] as [number, number]);

    if (points.length === 0) return;

    map.fitBounds(points, {
      padding: [40, 40],
      animate: true,
    });
  }, [items, map]);

  return null;
}

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
const MarkerClusterGroup = dynamic(
  () => import("react-leaflet-cluster"),
  { ssr: false }
);

/* ---------------------------------------------
 * Types
 * -------------------------------------------- */
type DirectoryItem = {
  id: number;
  congregationName: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
};

/* ---------------------------------------------
 * Component
 * -------------------------------------------- */
export default function DirectoryMap({
  items,
  activeId,
  onSelect,
}: {
  items: DirectoryItem[];
  activeId: number | null;
  onSelect: (id: number) => void;
}) {

  /* ✅ Load leaflet ONLY on client */
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

  return (
    <div className="relative h-[450px] rounded-xl overflow-hidden shadow z-0">

   {/* <MapContainer center={[10.0, 118.7]} zoom={8} className="h-full w-full"> */}
        <MapContainer
        center={[10.0, 118.7]}
        zoom={7}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <FitBounds items={items} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            maxClusterRadius={35}          // mas maliit = mas mabilis maghiwa-hiwalay
            disableClusteringAtZoom={8}    // ✅ pag zoom 8+, pins na
            >
            {items.map(
                (i) =>
                i.latitude &&
                i.longitude && (
                    <Marker
                      key={i.id}
                      position={[i.latitude, i.longitude]}
                      eventHandlers={{
                        click: () => onSelect(i.id),
                      }}
                      opacity={activeId && activeId !== i.id ? 0.5 : 1}
                    >

                          <Popup>
                            <div className="space-y-2 text-sm">
                              <strong className="block">{i.congregationName}</strong>
                              <p className="text-slate-600">{i.location}</p>

                              <div className="flex gap-2 pt-2">
                                {/* Internal details */}
                                <a
                                  href={`/directory/${i.id}`}
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  View details
                                </a>

                                {/* Google Maps directions */}
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${i.latitude},${i.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:underline text-xs"
                                >
                                  Get directions
                                </a>
                              </div>
                            </div>
                          </Popup>
                    </Marker>
                )
            )}
            </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
