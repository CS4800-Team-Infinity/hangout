import { useEffect, useState, useCallback } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { hangoutsAPI, HangoutEvent } from '@/lib/api';
import EventMarker from './EventMarker';

interface MapViewProps {
  className?: string;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
}

function MapContent() {
  const map = useMap();
  const [events, setEvents] = useState<HangoutEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const fetchEventsInBounds = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all events (in production, you'd filter by bounds)
      const response = await hangoutsAPI.getList({
        status: 'upcoming',
        isPublic: true
      });

      if (response.success) {
        // Filter only events with coordinates
        const eventsWithCoords = response.events.filter(
          event => event.coordinates?.lat && event.coordinates?.lng
        );
        setEvents(eventsWithCoords);
      }
    } catch (err) {
      console.error('Error fetching events for map:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventsInBounds();
  }, [fetchEventsInBounds]);

  // Refetch when map bounds change
  useEffect(() => {
    if (!map) return;

    const listener = map.addListener('idle', () => {
      fetchEventsInBounds();
    });

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [map, fetchEventsInBounds]);

  return (
    <>
      {loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md z-10">
          <p className="text-sm text-gray-600">Loading events...</p>
        </div>
      )}

      {events.map((event) => (
        <EventMarker
          key={event.eventId}
          event={event}
          isSelected={selectedEvent === event.eventId}
          onSelect={() => setSelectedEvent(event.eventId)}
          onClose={() => setSelectedEvent(null)}
        />
      ))}
    </>
  );
}

export default function MapView({
  className = '',
  defaultCenter = { lat: 37.7749, lng: -122.4194 }, // San Francisco
  defaultZoom = 11
}: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p className="text-red-500">Google Maps API key not configured</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId="hangout-map"
        >
          <MapContent />
        </Map>
      </APIProvider>
    </div>
  );
}
