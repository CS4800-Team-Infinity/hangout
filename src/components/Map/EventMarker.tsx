import {
  AdvancedMarker,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { HangoutEvent } from "@/lib/api";
import { MapPin } from "lucide-react";
import { useEffect } from "react";

interface EventMarkerProps {
  event: HangoutEvent;
  isSelected: boolean;
  onSelect: () => void;
}

export default function EventMarker({
  event,
  isSelected,
  onSelect,
}: EventMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  if (!event.coordinates) return null;
  const position = { lat: event.coordinates.lat, lng: event.coordinates.lng };

  useEffect(() => {
    if (!marker) return;
    const listener = marker.addListener("click", () => {
      console.log("Marker clicked:", event.title);
      onSelect();
    });
    return () => listener.remove();
  }, [marker, onSelect, event.title]);

  return (
    <AdvancedMarker ref={markerRef} position={position} title={event.title}>
      <div className="relative cursor-pointer select-none">
        {/* Main Pin */}
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 shadow-lg
            ${
              isSelected
                ? "bg-gradient-to-r from-[#F178B6] to-[#7879F1] scale-110 shadow-[0_0_15px_rgba(241,120,182,0.6)]"
                : "bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] hover:scale-105"
            }
          `}
        >
          <MapPin className="w-5 h-5 text-white" fill="white" />
        </div>

        {/* Always-on Pulse Effect */}
        <div
          className={`absolute inset-0 rounded-full pointer-events-none
            ${
              isSelected
                ? "bg-gradient-to-r from-[#F178B6] to-[#7879F1] opacity-80 animate-slowPing"
                : "bg-gradient-to-r from-[#7879F1] to-[#F178B6] opacity-60 animate-ping"
            }
          `}
        />
      </div>
    </AdvancedMarker>
  );
}
