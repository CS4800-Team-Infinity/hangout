import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import EventCardHome from "@/components/EventCard/EventCardHome";

interface Event {
  id?: string;
  _id?: string;
  title: string;
  datetime: string;
  location?: string;
  host?: string;
  status?: "Joined" | "Saved" | "Just Viewed";
  price?: string;
  imageUrl?: string;
  attendees?: { id: string; name: string; avatarUrl: string }[];
}

export default function EventsPage() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city");
  const category = searchParams.get("category");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        // Build the query dynamically
        const params = new URLSearchParams();
        if (city) params.append("city", city);
        if (category) params.append("category", category);
        params.append("status", "upcoming");

        const res = await fetch(`/api/hangouts/list?${params.toString()}`);
        const data = await res.json();

        if (Array.isArray(data.events)) {
          setEvents(data.events);
        } else if (Array.isArray(data)) {
          setEvents(data);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [city, category]);

  // Display title dynamically based on URL parameters
  const title = city
    ? `Events in ${city}`
    : category
    ? `${category
        .replace("-", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())} Events`
    : "All Events";

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 mt-20 text-black mb-20">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      {!loading && (
        <p className="text-gray-600 mb-6">
          {events.length > 0
            ? `Showing ${events.length} event${
                events.length > 1 ? "s..." : "..."
              }`
            : ""}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500">Loading events...</p>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
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
                attendees={event.attendees || []}
                eventId={event.id || event._id}
                variant="home"
                actions={true}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No events found.</p>
      )}
    </div>
  );
}
