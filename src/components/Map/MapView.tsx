import { useEffect, useState, useCallback, useRef } from "react";
import {
  APIProvider,
  Map,
  useMap,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import { hangoutsAPI, HangoutEvent } from "@/lib/api";
import EventMarker from "./EventMarker";
import EventCardMap from "../EventCard/EventCardMap";
import UserLocationMarker from "./UserLocationMarker";

interface MapViewProps {
  className?: string;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
  externalEvents?: HangoutEvent[];
  externalUserLocation?: { lat: number; lng: number } | null;
}

function isGeoJSONLocation(
  location: HangoutEvent["location"]
): location is { type: "Point"; coordinates: [number, number] } {
  return (
    typeof location === "object" &&
    location !== null &&
    "type" in location &&
    (location as any).type === "Point" &&
    Array.isArray((location as any).coordinates)
  );
}

function MapContent({
  defaultCenter,
}: {
  defaultCenter: { lat: number; lng: number };
}) {
  const map = useMap();
  const [events, setEvents] = useState<HangoutEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<HangoutEvent | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const lastReqId = useRef(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(defaultCenter);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setUserLocation(defaultCenter),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [defaultCenter]);

  const handleMarkerClick = (event: HangoutEvent) => {
    const eventDate = new Date(event.datetime || "");
    const month = eventDate
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();
    const day = eventDate.getDate().toString();

    setSelectedEvent({
      ...event,
      month,
      day,
    });
  };

  const fetchEventsInBounds = useCallback(async () => {
    if (!userLocation) return;
    const reqId = ++lastReqId.current;
    try {
      setLoading(true);
      const response = await hangoutsAPI.getList({
        status: "upcoming",
        isPublic: true,
        lat: userLocation.lat,
        lng: userLocation.lng,
      });
      if (reqId !== lastReqId.current) return;

      if (response.success && Array.isArray(response.events)) {
        const eventsWithCoords = response.events
          .map((event) => {
            // normalize coordinates
            if (
              typeof event.location === "object" &&
              event.location &&
              "type" in event.location &&
              (event.location as any).type === "Point" &&
              Array.isArray((event.location as any).coordinates)
            ) {
              const [lng, lat] = (event.location as any).coordinates;
              return { ...event, coordinates: { lat, lng } };
            }
            return event.coordinates?.lat && event.coordinates?.lng
              ? event
              : null;
          })
          .filter(Boolean) as HangoutEvent[];

        setEvents(eventsWithCoords);

        if (map) {
          const bounds = new google.maps.LatLngBounds();
          eventsWithCoords.forEach(
            (e) => e.coordinates && bounds.extend(e.coordinates)
          );
          bounds.extend(userLocation);
          map.fitBounds(bounds, 64);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [map, userLocation]);

  useEffect(() => {
    const t = setTimeout(() => userLocation && fetchEventsInBounds(), 500);
    return () => clearTimeout(t);
  }, [userLocation, fetchEventsInBounds]);

  useEffect(() => {
    if (map && userLocation) {
      map.setCenter(userLocation);
      map.setZoom(12);
    }
  }, [map, userLocation]);

  // Close InfoWindow when clicking anywhere on the map
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("click", () => {
      setSelectedEvent(null);
    });

    return () => listener.remove();
  }, [map]);

  // Close InfoWindow when clicking anywhere outside the map or markers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Prevent closing when clicking inside the InfoWindow or marker
      const infoWindow = document.querySelector(".gm-style-iw");
      const markerElements = document.querySelectorAll(".cursor-pointer");

      const clickedInsideInfoWindow = infoWindow?.contains(
        event.target as Node
      );
      const clickedMarker = Array.from(markerElements).some((el) =>
        el.contains(event.target as Node)
      );

      if (!clickedInsideInfoWindow && !clickedMarker) {
        setSelectedEvent(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md z-10">
          <p className="text-sm text-gray-600">Loading events...</p>
        </div>
      )}

      {userLocation && <UserLocationMarker userLocation={userLocation} />}

      {events.map((event) => (
        <EventMarker
          key={event.uuid || event._id}
          event={event}
          isSelected={
            selectedEvent
              ? (selectedEvent.uuid || selectedEvent._id) ===
                (event.uuid || event._id)
              : false
          }
          onSelect={() => setSelectedEvent(event)}
        />
      ))}

      {/* Controlled InfoWindow for the selected event */}
      {selectedEvent?.coordinates && (
        <InfoWindow
          position={selectedEvent.coordinates}
          maxWidth={540}
          shouldFocus={false}
          disableAutoPan={false}
          onCloseClick={() => setSelectedEvent(null)}
          pixelOffset={[0, -50]}
        >
          <div className="p-8 max-w-[540px] rounded-2xl ">
            <EventCardMap
              key={selectedEvent.uuid || selectedEvent._id}
              eventId={selectedEvent.uuid || selectedEvent._id}
              variant="list"
              month={selectedEvent.month}
              day={selectedEvent.day}
              title={selectedEvent.title}
              location={
                typeof selectedEvent.location === "string"
                  ? selectedEvent.location
                  : selectedEvent.location?.address ?? "Unknown location"
              }
              datetime={selectedEvent.datetime}
              host={selectedEvent.host}
              status={selectedEvent.status}
              price={selectedEvent.price}
              imageUrl={selectedEvent.imageUrl}
              attendees={selectedEvent.attendees}
              registrationUrl={selectedEvent.registrationUrl}
              actions={true}
            />
          </div>
        </InfoWindow>
      )}

      {!loading && events.length === 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-gray-700 text-sm px-3 py-1 rounded shadow">
          No nearby events found.
        </div>
      )}
    </>
  );
}

export default function MapView({
  className = "",
  defaultCenter = { lat: 34.0585684, lng: -117.8226053 }, // Cal Poly Pomona
  defaultZoom = 11,
}: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${className}`}
      >
        <p className="text-red-500">Google Maps API key not configured</p>
      </div>
    );
  }

  return (
    <div className={`${className} relative w-full h-full`}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId="hangout-map"
          style={{ width: "100%", height: "100%" }}
        >
          <MapContent defaultCenter={defaultCenter} />
        </Map>
      </APIProvider>
    </div>
  );
}
