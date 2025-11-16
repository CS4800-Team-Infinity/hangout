import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { hangoutsAPI, HangoutEvent } from "@/lib/api";
import {
  APIProvider,
  Map,
  useMap,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import EventMarker from "@/components/Map/EventMarker";
import EventCardMap from "@/components/EventCard/EventCardMap";
import UserLocationMarker from "@/components/Map/UserLocationMarker";
import EventCardList from "@/components/EventCard/EventCardList";

function MapContent({
  searchQuery,
  mapCenter,
  onVisibleEventsChange,
  onSearchStatus,
}: {
  searchQuery: string;
  mapCenter: { lat: number; lng: number };
  onVisibleEventsChange: (events: HangoutEvent[]) => void;
  onSearchStatus: (status: {
    found: boolean;
    type: "city" | "event" | "none";
  }) => void;
}) {
  const map = useMap();
  const [allEvents, setAllEvents] = useState<HangoutEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<HangoutEvent | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(mapCenter);

  // Fetch all events for the search location
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await hangoutsAPI.getList({
          status: "upcoming",
          isPublic: true,
          lat: mapCenter.lat,
          lng: mapCenter.lng,
          q: searchQuery.trim() || undefined, // Pass search query to API
        });

        if (response.success && Array.isArray(response.events)) {
          // Normalize coordinates for all events
          const eventsWithCoords = response.events
            .map((event) => {
              if (
                typeof event.location === "object" &&
                event.location &&
                "type" in event.location &&
                (event.location as any).type === "Point" &&
                Array.isArray((event.location as any).coordinates)
              ) {
                const [lng, lat] = (event.location as any).coordinates;

                // Parse date for month/day display
                const eventDate = new Date(event.datetime || event.date || "");
                const month = eventDate
                  .toLocaleString("en-US", { month: "short" })
                  .toUpperCase();
                const day = eventDate.getDate().toString();

                return { ...event, coordinates: { lat, lng }, month, day };
              }
              return event.coordinates?.lat && event.coordinates?.lng
                ? event
                : null;
            })
            .filter(Boolean) as HangoutEvent[];

          // API already filtered by search query, so just use the results
          const filteredEvents = eventsWithCoords;

          // Update search status based on results
          if (searchQuery.trim()) {
            if (filteredEvents.length > 0) {
              // Check if we have an exact or close match
              const lowerQuery = searchQuery.toLowerCase();
              const foundEvent =
                filteredEvents.find(
                  (event) => event.title.toLowerCase() === lowerQuery
                ) ||
                filteredEvents.find((event) =>
                  event.title.toLowerCase().includes(lowerQuery)
                );

              if (foundEvent) {
                onSearchStatus({ found: true, type: "event" });
                // If we found a specific event, zoom to it and select it
                if (map && foundEvent.coordinates) {
                  map.setCenter(foundEvent.coordinates);
                  map.setZoom(16);
                  setSelectedEvent(foundEvent);
                }
              } else {
                onSearchStatus({ found: true, type: "city" });
              }
            } else {
              onSearchStatus({ found: false, type: "none" });
            }
          } else {
            onSearchStatus({ found: true, type: "city" });
          }

          setAllEvents(filteredEvents);

          // Focus map based on search results
          if (map && filteredEvents.length > 0 && !searchQuery.trim()) {
            // No specific search query, fit bounds to show all events
            const bounds = new google.maps.LatLngBounds();
            filteredEvents.forEach(
              (e) => e.coordinates && bounds.extend(e.coordinates)
            );
            bounds.extend(mapCenter);
            map.fitBounds(bounds, 64);
          } else if (map && filteredEvents.length > 0 && searchQuery.trim()) {
            // Has search query but no exact match found above
            // Fit bounds to show all matching events
            const bounds = new google.maps.LatLngBounds();
            filteredEvents.forEach(
              (e) => e.coordinates && bounds.extend(e.coordinates)
            );
            if (filteredEvents.length > 0) {
              bounds.extend(mapCenter);
              map.fitBounds(bounds, 64);
            }
          } else if (map && !searchQuery.trim()) {
            // No search query, just center on the location
            map.setCenter(mapCenter);
            map.setZoom(12);
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [mapCenter, searchQuery, map]);

  // Calculate visible events whenever the map bounds change
  const updateVisibleEvents = useCallback(() => {
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) {
      onVisibleEventsChange(allEvents);
      return;
    }

    const visibleEvents = allEvents.filter((event) => {
      if (!event.coordinates) return false;
      return bounds.contains(event.coordinates);
    });

    onVisibleEventsChange(visibleEvents);
  }, [map, allEvents, onVisibleEventsChange]);

  // Listen for map bounds changes
  useEffect(() => {
    if (!map) return;

    const listeners = [
      map.addListener("bounds_changed", updateVisibleEvents),
      map.addListener("zoom_changed", updateVisibleEvents),
      map.addListener("dragend", updateVisibleEvents),
    ];

    // Initial update
    updateVisibleEvents();

    return () => {
      listeners.forEach((listener) => listener.remove());
    };
  }, [map, updateVisibleEvents]);

  const handleMarkerClick = (event: HangoutEvent) => {
    setSelectedEvent(event);
  };

  // Close InfoWindow when clicking on the map
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("click", () => {
      setSelectedEvent(null);
    });

    return () => listener.remove();
  }, [map]);

  return (
    <>
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md z-10">
          <p className="text-sm text-gray-600">Loading events...</p>
        </div>
      )}

      {userLocation && <UserLocationMarker userLocation={userLocation} />}

      {allEvents.map((event, index) => (
        <EventMarker
          key={event.uuid || event._id || `event-marker-${index}`}
          event={event}
          isSelected={
            selectedEvent
              ? (selectedEvent.uuid || selectedEvent._id) ===
                (event.uuid || event._id)
              : false
          }
          onSelect={() => handleMarkerClick(event)}
        />
      ))}

      {selectedEvent?.coordinates && (
        <InfoWindow
          position={selectedEvent.coordinates}
          maxWidth={540}
          shouldFocus={false}
          disableAutoPan={false}
          onCloseClick={() => setSelectedEvent(null)}
          pixelOffset={[0, -50]}
        >
          <div className="p-8 max-w-[540px] rounded-2xl">
            <EventCardMap
              key={selectedEvent._id}
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
              eventId={selectedEvent._id}
              registrationUrl={selectedEvent.registrationUrl}
              actions={true}
            />
          </div>
        </InfoWindow>
      )}

      {!loading && allEvents.length === 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-gray-700 text-sm px-3 py-1 rounded shadow">
          No events found for this search.
        </div>
      )}
    </>
  );
}

export default function SearchResults() {
  const router = useRouter();
  const { q, lat, lng, city } = router.query;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [visibleEvents, setVisibleEvents] = useState<HangoutEvent[]>([]);
  const [searchStatus, setSearchStatus] = useState<{
    found: boolean;
    type: "city" | "event" | "none";
  }>({ found: true, type: "city" });
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 34.0585684,
    lng: -117.8226053,
  });

  useEffect(() => {
    if (router.isReady) {
      const query = (q as string) || "";
      const location = city as string;

      // Parse coordinates with validation
      const parsedLat = lat ? parseFloat(lat as string) : null;
      const parsedLng = lng ? parseFloat(lng as string) : null;

      // Only update if we have valid numbers, otherwise use defaults
      const latitude =
        parsedLat !== null && !isNaN(parsedLat) ? parsedLat : 34.0585684;
      const longitude =
        parsedLng !== null && !isNaN(parsedLng) ? parsedLng : -117.8226053;

      setSearchQuery(query);
      setSearchLocation(location);
      setMapCenter({ lat: latitude, lng: longitude });
    }
  }, [router.isReady, q, lat, lng, city]);

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleVisibleEventsChange = useCallback((events: HangoutEvent[]) => {
    setVisibleEvents(events);
  }, []);

  const handleSearchStatus = useCallback(
    (status: { found: boolean; type: "city" | "event" | "none" }) => {
      setSearchStatus(status);
    },
    []
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Google Maps API key not configured</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>←</span>
              <span>Back to home page</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              Date
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              Category
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              Distance
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              Free
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              This Week
            </button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Clear Filters
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
            <button className="px-3 py-1 text-sm rounded-full bg-[#5D5FEF] text-white">
              List
            </button>
            <button className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200">
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Google Maps View */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={mapCenter}
                defaultZoom={12}
                gestureHandling="greedy"
                disableDefaultUI={false}
                mapId="hangout-search-map"
                style={{ width: "100%", height: "100%" }}
              >
                <MapContent
                  searchQuery={searchQuery}
                  mapCenter={mapCenter}
                  onVisibleEventsChange={handleVisibleEventsChange}
                  onSearchStatus={handleSearchStatus}
                />
              </Map>
            </APIProvider>
          </div>

          {/* Right Panel - Event List (filtered by visible map area) */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="p-6 h-full flex flex-col">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : `Search Results for "${searchLocation}"`}
                </h1>

                {!searchStatus.found && searchQuery && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-yellow-800 text-sm font-medium">
                      ⚠️ No results found for "{searchQuery}"
                    </p>
                    <p className="text-yellow-700 text-xs mt-1">
                      Try searching for a different event name or city, or
                      browse events near {searchLocation}.
                    </p>
                  </div>
                )}

                <p className="text-gray-600 text-sm">
                  Browse events and explore them on the interactive map. Pan and
                  zoom to filter the list.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Showing {visibleEvents.length} event
                  {visibleEvents.length !== 1 ? "s" : ""} in the visible area
                  {searchQuery &&
                    searchStatus.found &&
                    ` matching "${searchQuery}"`}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {visibleEvents.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">
                      No events visible in this area
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleEvents.map((event, index) => (
                      <EventCardList
                        key={event.uuid || event._id || `event-list-${index}`}
                        month={event.month}
                        day={event.day}
                        title={event.title}
                        location={
                          typeof event.location === "string"
                            ? event.location
                            : event.location?.address ?? "Unknown location"
                        }
                        datetime={event.datetime}
                        host={event.host}
                        status={event.status}
                        price={event.price}
                        imageUrl={event.imageUrl}
                        attendees={event.attendees}
                        eventId={event._id || event.uuid}
                        registrationUrl={event.registrationUrl}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
