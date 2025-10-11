import { useEffect, useState } from "react";
import { hangoutsAPI, HangoutEvent } from "@/lib/api";
import EventCardList from "./EventCardList";

interface EventListProps {
  status?: "upcoming" | "ongoing" | "completed" | "cancelled" | "all";
  isPublic?: boolean;
  className?: string;
}

export default function EventList({
  status = "upcoming",
  isPublic,
  className = "",
}: EventListProps) {
  const [events, setEvents] = useState<HangoutEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await hangoutsAPI.getList({
          status,
          isPublic,
        });

        if (response.success) {
          setEvents(response.events);
        } else {
          setError(response.error || "Failed to fetch events");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [status, isPublic]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-gray-500">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-gray-500">No events found</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 overflow-y-auto ${className}`}>
      {events.map((event) => (
        <EventCardList
          key={event.uuid || event._id}
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
          eventId={event.uuid || event._id}
          registrationUrl={event.registrationUrl}
        />
      ))}
    </div>
  );
}
