import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useState, useCallback } from "react";

interface MapPickerProps {
  value?: { lat: number; lng: number };
  onSelect: (coords: { lat: number; lng: number }) => void;
}

export default function MapPicker({ value, onSelect }: MapPickerProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    value || null
  );

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      const point = { lat, lng };
      setMarker(point);
      onSelect(point);
    },
    [onSelect]
  );

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <GoogleMap
      zoom={15}
      center={marker || { lat: 34.0555, lng: -117.82 }}
      mapContainerStyle={{ width: "100%", height: "350px" }}
      onClick={handleMapClick}
    >
      {marker && <Marker position={marker} />}
    </GoogleMap>
  );
}
