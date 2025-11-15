"use client";

import Link from "next/link";
import EventCardHome from "./EventCard/EventCardHome";

interface RelatedEvent {
  id?: string;
  _id?: string;
  title: string;
  datetime: string;
  location?: string;
  host?: string;
  imageUrl?: string;
  price?: number;
  attendees?: any[];
  category?: string;
}

export default function RelatedEvents({ events }: { events: RelatedEvent[] }) {
  if (!events || events.length === 0) return null;

  const limitedEvents = events.slice(0, 4);

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black">
          Other events you may like
        </h2>

        <Link
          href="/events"
          className="text-[#5D5FEF] hover:text-[#EF5DA8] text-sm font-medium"
        >
          See all events
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {limitedEvents.map((event) => {
          const priceValue = Number(event.price ?? 0);
          const priceText =
            priceValue === 0 ? "Free" : `$${priceValue.toFixed(2)}`;

          return (
            <EventCardHome
              key={event.id || event._id}
              title={event.title}
              datetime={event.datetime}
              location={event.location || "Unknown location"}
              host={event.host || "Anonymous"}
              price={priceText}
              imageUrl={event.imageUrl || "/images/placeholder.png"}
              attendees={event.attendees || []}
              eventId={event.id || event._id}
            />
          );
        })}
      </div>
    </div>
  );
}
