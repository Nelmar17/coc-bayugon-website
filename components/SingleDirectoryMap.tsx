"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

/* dynamic imports (no SSR) */
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

type Props = {
  latitude: number;
  longitude: number;
  congregationName: string;
  location?: string;
};

export default function SingleDirectoryMap({
  latitude,
  longitude,
  congregationName,
  location,
}: Props) {
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
    <div className="h-full w-full rounded-2xl overflow-hidden border shadow">
        <MapContainer
          center={[latitude, longitude]}
          zoom={14}
          scrollWheelZoom={false}
          touchZoom={false}
          doubleClickZoom={false}
          dragging={true}        // pwede pa i-drag (optional)
          className="h-full w-full"
        >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="space-y-2 text-sm">
              <strong>{congregationName}</strong>
              {location && <p>{location}</p>}

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-md"
              >
                Get directions
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}










// "use client";

// import dynamic from "next/dynamic";
// import "leaflet/dist/leaflet.css";

// const MapContainer = dynamic(
//   () => import("react-leaflet").then((m) => m.MapContainer),
//   { ssr: false }
// );
// const TileLayer = dynamic(
//   () => import("react-leaflet").then((m) => m.TileLayer),
//   { ssr: false }
// );
// const Marker = dynamic(
//   () => import("react-leaflet").then((m) => m.Marker),
//   { ssr: false }
// );
// const Popup = dynamic(
//   () => import("react-leaflet").then((m) => m.Popup),
//   { ssr: false }
// );

// export default function SingleDirectoryMap({
//   lat,
//   lng,
//   name,
// }: {
//   lat: number;
//   lng: number;
//   name: string;
// }) {
//   return (
//     <div className="h-[350px] rounded-xl overflow-hidden shadow">
//       <MapContainer center={[lat, lng]} zoom={15} className="h-full w-full">
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//         <Marker position={[lat, lng]}>
//           <Popup>{name}</Popup>
//         </Marker>
//       </MapContainer>
//     </div>
//   );
// }
