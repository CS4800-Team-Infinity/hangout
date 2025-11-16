import { useEffect, useState } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";

interface UserLocationMarkerProps {
  userLocation: google.maps.LatLngLiteral;
}

export default function UserLocationMarker({
  userLocation,
}: UserLocationMarkerProps) {
  const map = useMap();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!map || !userLocation) return;

    const circle = new google.maps.Circle({
      center: userLocation,
      radius: 50,
      fillColor: "#4285F4",
      fillOpacity: 0.15,
      strokeColor: "#4285F4",
      strokeOpacity: 0.3,
      strokeWeight: 1,
      map,
    });

    return () => circle.setMap(null);
  }, [map, userLocation]);

  return (
    <AdvancedMarker position={userLocation}>
      <div
        className="relative flex items-center justify-center group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute w-10 h-10 rounded-full bg-blue-400 opacity-30 animate-ping" />

        <div className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg bg-gradient-to-r from-[#5D9BFF] to-[#1E68F0]">
          <MapPin className="w-5 h-5 text-white" fill="white" />
        </div>

        <div className="absolute inset-0 rounded-full bg-blue-400 opacity-40 animate-pulse blur-sm" />

        {hovered && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-md shadow-md border border-gray-200 whitespace-nowrap">
            You're here
            <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-white rotate-45 border-l border-b border-gray-200" />
          </div>
        )}
      </div>
    </AdvancedMarker>
  );
}
