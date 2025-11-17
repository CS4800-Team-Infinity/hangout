"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import EventCardHome from "@/components/EventCard/EventCardHome";

const HotArea = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchHotAreaEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/events/hot-areas?limit=12");
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching hot area events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotAreaEvents();
  }, []);

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + itemsPerPage < events.length;

  const handlePrev = () =>
    canGoPrev && setStartIndex(Math.max(0, startIndex - itemsPerPage));

  const handleNext = () =>
    canGoNext &&
    setStartIndex(
      Math.min(events.length - itemsPerPage, startIndex + itemsPerPage)
    );

  const visibleEvents = events.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="mb-0">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-6 h-6 text-[#5D5FEF]" />
          <h2 className="text-2xl font-bold text-gray-900">Hot Areas</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg h-64 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 relative z-20">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-[#5D5FEF]" />
          <h2 className="text-2xl font-bold text-gray-900">Hot Areas</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`p-2 rounded-full border transition-colors text-[#5D5FEF] ${
              canGoPrev
                ? "border-gray-300 hover:bg-gray-100 hover:text-[#EF5DA8]"
                : "border-gray-200 text-[#5D5FEF] cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`p-2 rounded-full border transition-colors text-[#5D5FEF] ${
              canGoNext
                ? "border-gray-300 hover:bg-gray-100 hover:text-[#EF5DA8]"
                : "border-gray-200 text-[#5D5FEF] cursor-not-allowed"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-0">
        {visibleEvents.map((event: any) => (
          <EventCardHome
            key={event.id || event._id}
            eventId={event.id || event._id}
            title={event.title}
            location={event.location}
            price={event.price}
            imageUrl={event.imageUrl ?? event.image}
            datetime={event.datetime || event.date}
            host={event.host || "Anonymous"}
            status={event.status || "Just Viewed"}
            attendees={event.attendees}
            variant="home"
            actions={true}
          />
        ))}
      </div>
    </div>
  );
};

export default HotArea;
