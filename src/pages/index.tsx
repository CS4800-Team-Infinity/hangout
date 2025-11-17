import { useEffect, useState } from "react";
import MapView from "@/components/Map/MapView";
import NearbyEventsSection from "@/components/NearbyEventsSection";
import ExploreCategories from "@/components/ExploreCategories";
import PopularCities from "@/components/PopularCities";

interface Event {
  id?: string;
  _id?: string;
  title: string;
  datetime: string;
  attendees?: { id: string; name: string; avatarUrl: string }[];
  price?: string;
  imageUrl?: string;
  host?: string;
  location?: string;
  status?: "Joined" | "Saved" | "Just Viewed";
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    const fetchEvents = async (lat?: number, lng?: number) => {
      try {
        const query =
          lat !== undefined && lng !== undefined
            ? `?lat=${lat}&lng=${lng}`
            : `?city=Pomona`;
        console.log(
          "Fetching hangouts from:",
          `/api/hangouts/list${query}&status=upcoming&isPublic=true`
        );

        const res = await fetch(
          `/api/hangouts/list${query}&status=upcoming&isPublic=true`
        );
        const result = await res.json();

        if (Array.isArray(result.events)) {
          setEvents(result.events.slice(0, 8));
        } else if (Array.isArray(result)) {
          setEvents(result.slice(0, 8));
        } else {
          console.warn("No events found in API response:", result);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    };

    // Keep this after fetchEvents
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchEvents(latitude, longitude);
        },
        (err) => {
          console.warn("Location access denied, defaulting to Pomona:", err);
          fetchEvents(); // fallback
        }
      );
    } else {
      console.warn("Geolocation not supported, defaulting to Pomona");
      fetchEvents(); // fallback
    }
  }, []);

  return (
    <div className="min-h-screen text-gray-900 pt-28 lg:pt-14 space-y-6">
      {/* ===== Hero Section ===== */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="md:w-[80%] w-full h-[400px] rounded-2xl overflow-hidden shadow-lg">
          <MapView />
        </div>
        <div className="md:w-1/2 w-full text-center md:text-left space-y-6 px-6">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-[#EF5DA8] via-[#B07CFA] to-[#5D5FEF] bg-clip-text text-transparent leading-tight">
            Hangout
          </h1>
          <p className="text-gray-600 text-lg">
            Create, join, and track events with ease — from casual meetups to
            professional workshops.
          </p>
        </div>
      </section>

      {/* ===== Events Section ===== */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <NearbyEventsSection />
      </section>

      {/* ===== Join Hangout Banner ===== */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex justify-center">
        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-lg flex flex-col items-center justify-center text-center text-white sm:p-8 h-[240px] sm:h-[320px] md:h-[380px] bg-cover bg-center"
          style={{
            backgroundImage: "url('/hangoutletter.png')",
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            <h3 className="text-3xl sm:text-4xl font-bold drop-shadow-md">
              Join Hangout
            </h3>
            <p className="text-md sm:text-lg text-white/90 max-w-xl px-3">
              Find your next hangout, meet great people, and never miss a good
              time—join Hangout today!
            </p>
            <a
              href="/signup"
              className="bg-white text-md sm:text-lg font-bold text-[#5D5FEF] px-6 py-3 rounded-full shadow-lg shadow-[#5D5FEF]/40 hover:bg-[#F178B6] hover:text-white transition"
            >
              ⋆｡°✩ Sign up for free
            </a>
          </div>
        </div>
      </section>

      {/* ===== Explore Categories ===== */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 text-white">
        <ExploreCategories />
      </section>

      {/* ===== Popular Cities ===== */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 mb-20">
        <PopularCities />
      </section>
    </div>
  );
}
