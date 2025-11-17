"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import EventCardHome from "@/components/EventCard/EventCardHome";

const HotToday = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchHotEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/events/hot-today?limit=12");
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching hot events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotEvents();
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
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900">Hot Today</h2>
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
    <div className="mb-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 ">
          <Flame className="w-6 h-6 text-[#EF5DA8]" />
          <h2 className="text-2xl font-bold text-gray-900">Hot Today</h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`p-2 rounded-full border transition-colors text-[#EF5DA8] ${
              canGoPrev
                ? "border-gray-300 hover:bg-gray-100 hover:text-[#5D5FEF]"
                : "border-gray-200 text-[#EF5DA8] cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`p-2 rounded-full border transition-colors text-[#EF5DA8] ${
              canGoNext
                ? "border-gray-300 hover:bg-gray-100 hover:text-[#5D5FEF]"
                : "border-gray-200 text-[#EF5DA8] cursor-not-allowed"
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleEvents.map((event: any) => {
          const date = event.datetime ? new Date(event.datetime) : null;

          const month = date
            ? date.toLocaleString("default", { month: "short" })
            : "";
          const day = date ? date.getDate().toString() : "";

          return (
            <EventCardHome
              key={event._id || event.id}
              eventId={event._id || event.id}
              month={month}
              day={day}
              title={event.title || "Untitled Event"}
              location={event.location || "Unknown location"}
              price={event.price ?? "Free"}
              datetime={event.datetime || event.date}
              host={event.host || "Anonymous"}
              status={event.status || "Upcoming"}
              attendees={event.attendees || []}
              imageUrl={
                event.imageUrl || event.image || "/images/placeholder.png"
              }
              variant="home"
              actions={true}
            />
          );
        })}
      </div>
    </div>
  );
};

export default HotToday;
