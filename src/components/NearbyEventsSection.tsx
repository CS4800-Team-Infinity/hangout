import { useEffect, useState } from "react";
import Link from "next/link";
import EventCardHome from "./EventCard/EventCardHome";

export default function NearbyEventsSection() {
  const [events, setEvents] = useState<any[]>([]);
  const [city, setCity] = useState("Pomona");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log("📍 Got user location:", latitude, longitude);

          try {
            const res = await fetch(
              `/api/hangouts/list?lat=${latitude}&lng=${longitude}&status=upcoming&isPublic=true`
            );
            const data = await res.json();

            if (Array.isArray(data.events) && data.events.length > 0) {
              setEvents(data.events.slice(0, 8));
              // Try to detect city name if backend sends one
              setCity(data.city || "your area");
            } else {
              console.warn("No events found near current location");
              fetchPomonaEvents();
            }
          } catch (err) {
            console.error("Failed to fetch nearby events:", err);
            fetchPomonaEvents();
          } finally {
            setLoading(false);
          }
        },
        () => {
          console.warn("User blocked location — fallback to Pomona");
          fetchPomonaEvents();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      console.warn("Geolocation not supported — fallback to Pomona");
      fetchPomonaEvents();
    }
  }, []);

  const fetchPomonaEvents = async () => {
    try {
      const res = await fetch(
        `/api/hangouts/list?city=Pomona&status=upcoming&isPublic=true`
      );
      const data = await res.json();
      setEvents(data.events || []);
      setCity("Pomona");
    } catch (err) {
      console.error("Error fetching Pomona events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Events near {city}</h2>
        <Link
          href="/events"
          className="text-[#EF5DA8] hover:text-[#5D5FEF] font-bold text-lg"
        >
          See all...
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500 text-center">
          No events available right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {events.map((event) => {
            const date = new Date(event.datetime);
            const month = date.toLocaleString("default", { month: "short" });
            const day = date.getDate().toString();

            return (
              <EventCardHome
                key={event.id || event._id}
                month={month}
                day={day}
                title={event.title}
                location={event.location || "Unknown location"}
                datetime={event.datetime}
                host={event.host || "Anonymous"}
                status={event.status || "Just Viewed"}
                price={event.price || "Free"}
                imageUrl={
                  event.imageUrl ||
                  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop"
                }
                attendees={event.attendees}
                eventId={event.id || event._id}
                variant="home"
                actions={true}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
