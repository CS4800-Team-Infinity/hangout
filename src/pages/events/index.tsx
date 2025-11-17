import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { hangoutsAPI, HangoutEvent } from "@/lib/api";
import EventCardHome from "@/components/EventCard/EventCardHome";
import EventCardMap from "@/components/EventCard/EventCardMap";
import EventMarker from "@/components/Map/EventMarker";
import UserLocationMarker from "@/components/Map/UserLocationMarker";
import { EventCardStatus } from "@/types/EventCard";

import {
  APIProvider,
  Map,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";

type MapEvent = HangoutEvent & {
  coordinates?: google.maps.LatLngLiteral;
  month: string;
  day: string;
  date: string;
  datetime: string;
};

function MapBoundsFitter({
  allEvents,
  userLocation,
}: {
  allEvents: HangoutEvent[];
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || allEvents.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    let hasBounds = false;

    allEvents.forEach((e) => {
      if (e.coordinates) {
        bounds.extend(e.coordinates);
        hasBounds = true;
      }
    });

    if (userLocation) {
      bounds.extend(userLocation);
      hasBounds = true;
    }

    if (hasBounds) {
      setTimeout(() => {
        map.fitBounds(bounds, 80);
      }, 800);
    }
  }, [map, allEvents, userLocation]);

  return null;
}

export default function EventsPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const searchParams = useSearchParams();
  const city = searchParams.get("city");
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");

  const [view, setView] = useState<"list" | "map">("list");
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const FALLBACK_LOCATION = { lat: 34.0585684, lng: -117.8226053 };
  const [mapCenter, setMapCenter] = useState(FALLBACK_LOCATION);
  const [mapZoom, setMapZoom] = useState(11);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (city) params.append("city", city);
        if (category) params.append("category", category);
        if (tag) params.append("tag", tag);
        params.append("status", "upcoming");

        const res = await fetch(`/api/hangouts/list?${params.toString()}`);
        const data = await res.json();

        const rawEvents = Array.isArray(data.events)
          ? data.events
          : Array.isArray(data)
          ? data
          : [];

        const normalized: MapEvent[] = rawEvents.map((e: any): MapEvent => {
          const rawDate = e.date ?? e.datetime ?? new Date().toISOString();
          const date = new Date(rawDate);

          const rawCoordinates =
            Array.isArray(e.location?.coordinates) &&
            e.location.coordinates.length === 2
              ? e.location.coordinates
              : e.coordinates && e.coordinates.lat && e.coordinates.lng
              ? [e.coordinates.lng, e.coordinates.lat] // convert to GeoJSON order
              : null;

          const coordinates = rawCoordinates
            ? { lat: rawCoordinates[1], lng: rawCoordinates[0] }
            : null;

          return {
            ...e,
            coordinates,
            month: date.toLocaleString("default", { month: "short" }),
            day: date.getDate().toString(),
            date: rawDate,
            datetime: rawDate,
          };
        });

        setEvents(normalized);
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [city, category, tag]);

  // Display title dynamically based on URL parameters
  const title = city
    ? `Events in ${city}`
    : category
    ? `${category
        .replace("-", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())} Events`
    : tag
    ? `${tag.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Events`
    : "All Events";

  const normalizeStatus = (status?: string): EventCardStatus => {
    const allowed: EventCardStatus[] = [
      "Joined",
      "Saved",
      "Just Viewed",
      "upcoming",
      "ongoing",
      "completed",
      "cancelled",
    ];

    if (!status) return "Just Viewed";

    const lower = status.toLowerCase();

    if (allowed.includes(lower as EventCardStatus)) {
      return lower as EventCardStatus;
    }

    return "Just Viewed";
  };

  // User location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported, using fallback location");
      setMapCenter(FALLBACK_LOCATION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const user = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        console.log("User location obtained:", user);
        setUserLocation(user);
        setMapCenter(user);
        setMapZoom(14); // Zoom in a bit when we have user location
      },
      (error) => {
        console.log("Geolocation denied or failed:", error.message);
        console.log("Using fallback location:", FALLBACK_LOCATION);
        setMapCenter(FALLBACK_LOCATION);
        setMapZoom(11);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pt-40 lg:pt-25 text-black mb-20">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
            <p className="text-gray-500 text-sm">
              {loading
                ? "Loading events..."
                : events.length === 0
                ? `No ${title.toLowerCase()} found`
                : `Showing ${events.length} events`}
            </p>
          </div>

          {/* view switch */}
          <div className="flex items-center gap-2">
            {/* List view button*/}
            <button
              onClick={() => setView("list")}
              className={`
                rounded-lg p-[2px]
                bg-gradient-to-r from-[#EF5DA8] via-[#B07CFA] to-[#5D5FEF]
              `}
            >
              <span
                className={`
                  block px-4 py-2 rounded-lg text-sm
                  ${
                    view === "list"
                      ? "bg-gradient-to-r from-[#EF5DA8] via-[#B07CFA] to-[#5D5FEF] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-[#EF5DA8] hover:via-[#B07CFA] hover:to-[#5D5FEF] hover:text-white"
                  }
                `}
              >
                List View
              </span>
            </button>

            {/* Map view button*/}
            <button
              onClick={() => setView("map")}
              className={`
                rounded-lg p-[2px]
                bg-gradient-to-r from-[#EF5DA8] via-[#B07CFA] to-[#5D5FEF]
                `}
            >
              <span
                className={`
                  block px-4 py-2 rounded-lg text-sm
                  ${
                    view === "map"
                      ? "bg-gradient-to-r from-[#EF5DA8] via-[#B07CFA] to-[#5D5FEF] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-[#EF5DA8] hover:via-[#B07CFA] hover:to-[#5D5FEF] hover:text-white"
                  }
                `}
              >
                Map View
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div>Loading...</div>
        ) : view === "list" ? (
          // List view
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {events.map((event) => {
              const date = new Date(event.date);
              const month = date.toLocaleString("default", { month: "short" });
              const day = date.getDate().toString();

              return (
                <EventCardHome
                  key={event._id}
                  month={month}
                  day={day}
                  title={event.title}
                  location={
                    typeof event.location === "string"
                      ? event.location
                      : event.location?.address ?? "Unknown location"
                  }
                  datetime={event.date}
                  host={
                    typeof event.host === "string"
                      ? event.host
                      : event.host?.name || "Anonymous"
                  }
                  status={normalizeStatus(event.status)}
                  price={event.price ? String(event.price) : "Free"}
                  imageUrl={event.imageUrl || "/images/placeholder.png"}
                  attendees={
                    Array.isArray(event.attendees)
                      ? event.attendees.map((a: any) => ({
                          id: a._id ?? a.id ?? "",
                          name: a.name ?? "Unknown",
                          avatarUrl: a.avatarUrl ?? "",
                        }))
                      : []
                  }
                  eventId={event._id}
                  variant="home"
                  actions={true}
                />
              );
            })}
          </div>
        ) : (
          // Map view
          <div className="h-[75vh] w-full rounded-xl overflow-hidden shadow">
            <APIProvider apiKey={apiKey!}>
              <Map
                defaultCenter={mapCenter}
                defaultZoom={11}
                mapId="hangout-events-map"
                style={{ height: "100%", width: "100%" }}
              >
                <MapBoundsFitter
                  allEvents={events}
                  userLocation={userLocation}
                />

                {userLocation && (
                  <UserLocationMarker userLocation={userLocation} />
                )}

                {events.map((event) => (
                  <EventMarker
                    key={event._id}
                    event={event}
                    isSelected={selectedEvent?._id === event._id}
                    onSelect={() => setSelectedEvent(event)}
                  />
                ))}

                {selectedEvent && (
                  <InfoWindow
                    position={selectedEvent.coordinates}
                    onCloseClick={() => setSelectedEvent(null)}
                  >
                    <EventCardMap
                      month={new Date(selectedEvent.date).toLocaleString(
                        "default",
                        { month: "short" }
                      )}
                      day={new Date(selectedEvent.date).getDate().toString()}
                      title={selectedEvent.title}
                      location={
                        typeof selectedEvent.location === "string"
                          ? selectedEvent.location
                          : selectedEvent.location?.address ?? "Unknown"
                      }
                      datetime={selectedEvent.date}
                      host={selectedEvent.host}
                      status={normalizeStatus(selectedEvent.status)}
                      price={
                        selectedEvent.price
                          ? String(selectedEvent.price)
                          : "Free"
                      }
                      imageUrl={selectedEvent.imageUrl}
                      attendees={
                        Array.isArray(selectedEvent.attendees)
                          ? selectedEvent.attendees.map((a: any) => ({
                              id: a._id ?? a.id ?? "", // ensure string
                              name: a.name ?? "Unknown",
                              avatarUrl: a.avatarUrl ?? "",
                            }))
                          : []
                      }
                      eventId={selectedEvent._id || selectedEvent.uuid}
                      registrationUrl={selectedEvent.registrationUrl}
                      actions={true}
                    />
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          </div>
        )}
      </div>
    </div>
  );
}
