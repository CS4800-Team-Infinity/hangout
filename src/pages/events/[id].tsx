import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import ShareMenu from "@/components/common/ShareMenu";
import RSVPDialog from "@/components/events/RSVPDialog";
import CheckoutDialog from "@/components/events/CheckoutDialog";
import RelatedEvents from "@/components/RelatedEvents";

import type { EventDetails } from "@/types/EventDetails";

interface User {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
}

export default function EventDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [fullName, setFullName] = useState("");

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return;

        const { user: apiUser } = await response.json();
        if (!apiUser) return;

        setUser({
          name: apiUser.name || "",
          email: apiUser.email || "",
        });

        console.log("Fetched user:", apiUser);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch event details
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/events/${id}`, { headers });
        const data = await response.json();

        if (!response.ok || !data.success) {
          if (response.status === 404) {
            setError("Event not found");
          } else if (response.status === 401 || response.status === 403) {
            setError("You do not have access to this event");
          } else {
            setError(data.error || "Failed to load event");
          }
          return;
        }

        setEvent(data.event);
        setRelatedEvents(data.relatedEvents || []);
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    async function checkRsvp() {
      if (!event?._id || !user?.email) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/events/${event._id}/rsvp`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const attendees = data?.attendees || [];

      const already = attendees.some(
        (a: any) =>
          (a.email ?? "").toLowerCase() === (user?.email ?? "").toLowerCase()
      );

      if (already) {
        router.push(`/events/${event._id}/registered`);
      }
    }

    checkRsvp();
  }, [user, event?._id]);

  useEffect(() => {
    async function check() {
      if (!event?._id || !user?.email) return;

      const res = await fetch(`/api/events/${event._id}/attendees`);
      const data = await res.json();

      const attendees = data?.attendees || [];

      const match = attendees.find(
        (a: any) =>
          (a.email ?? "").toLowerCase() === (user.email ?? "").toLowerCase()
      );

      if (match) {
        setAlreadyRegistered(true);
        setFullName(match.name ?? "");
      } else {
        setAlreadyRegistered(false);
      }
    }

    check();
  }, [user?.email, event?._id]);

  // Check for checkout parameter from login redirect
  useEffect(() => {
    if (router.isReady && event) {
      const checkoutParam = router.query.checkout;
      const quantityParam = router.query.quantity;

      // Support both "1" and "true" for backward compatibility
      if (checkoutParam === "true" || checkoutParam === "1") {
        setIsCheckoutOpen(true);
        if (quantityParam) {
          setCheckoutQuantity(parseInt(quantityParam as string));
        }

        // Clean up URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete("checkout");
        url.searchParams.delete("quantity");
        url.searchParams.delete("fromAuth");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [router.isReady, router.query.checkout, router.query.quantity, event]);

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleGetDirections = () => {
    if (event?.location.coordinates) {
      const [lng, lat] = event.location.coordinates;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(mapsUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D5FEF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-16">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {error === "Event not found" ? "404" : "Oops!"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "Something went wrong"}
          </p>
          <Link href="/events">
            <Button className="bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] text-white hover:from-[#EF5DA8] hover:to-[#5D5FEF]">
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = Number(event?.price ?? 0);

  const eventDate = new Date(event.date);
  const dayOfWeek = eventDate.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const startTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Calculate end time (assuming 2 hours duration if not specified)
  const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
  const endTime = endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const spotsLeft = event.maxParticipants
    ? event.maxParticipants - event.attendeeCount
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="max-w-6xl mx-auto px-6 pt-24">
        <div className="relative w-full h-[280px] rounded-2xl overflow-hidden mb-6">
          <Image
            src={event.imageUrl || "/images/placeholder.png"}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-8 space-y-6">
        {/* Event Header */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            {dayOfWeek}, {formattedDate}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm">
                Hosted by <strong>{event.host.name}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                aria-label={isSaved ? "Unsave event" : "Save event"}
              >
                <svg
                  className={`w-5 h-5 ${
                    isSaved ? "fill-[#EF5DA8] text-[#EF5DA8]" : "text-gray-700"
                  }`}
                  fill={isSaved ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  aria-label="Share event"
                >
                  <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>
                {showShareMenu && (
                  <ShareMenu
                    eventId={event._id}
                    title={event.title}
                    onClose={() => setShowShareMenu(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="flex items-center justify-between py-4 border-y border-gray-200">
          <div>
            <span className="text-lg font-semibold text-black">
              {price === 0 ? "Free" : `$${price.toFixed(2)}`}
            </span>
            <p className="text-sm text-gray-600">
              {startTime} - {endTime} PDT
            </p>
          </div>
          {/* RSVP Dialog */}
          <RSVPDialog event={event} user={user} />
        </div>

        {/* Date and Time */}
        <div className="space-y-2 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Date and time
          </h2>
          <p className="text-gray-700 pl-7">
            Starts on {dayOfWeek}, {formattedDate} · {startTime} - {endTime} PDT
          </p>
        </div>

        {/* Location */}
        <div className="space-y-3 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Location
          </h2>
          <div className="pl-7 space-y-3">
            <div>
              <p className="font-medium text-gray-900">
                {event.location.address.split(",")[0]}
              </p>
              <p className="text-sm text-gray-600">{event.location.address}</p>
              <button
                onClick={handleGetDirections}
                className="text-[#5D5FEF] hover:text-[#EF5DA8] text-sm font-medium mt-1 flex items-center gap-1"
              >
                Get directions
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>
            </div>
            {event.location.coordinates &&
              process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                  <APIProvider
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                  >
                    <Map
                      defaultCenter={{
                        lat: event.location.coordinates[1],
                        lng: event.location.coordinates[0],
                      }}
                      defaultZoom={14}
                      mapId="event-details-map"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <Marker
                        position={{
                          lat: event.location.coordinates[1],
                          lng: event.location.coordinates[0],
                        }}
                      />
                    </Map>
                  </APIProvider>
                </div>
              )}
          </div>
        </div>

        {/* Event Description */}
        <div className="space-y-3 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Event Description
          </h2>
          <div className="text-gray-700 space-y-4">
            <p className="whitespace-pre-line">{event.description}</p>
            {event.host.bio && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  About the Host
                </h3>
                <p className="text-gray-700">{event.host.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tickets & Registration */}
        <div className="space-y-4 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Tickets & Registration
          </h2>
          <div className="space-y-4">
            <div className="bg-[#f1ecfc] rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    General Admission
                  </p>
                  {spotsLeft !== null && (
                    <p className="text-sm text-gray-600 mt-1">
                      ({event.attendeeCount}/{event.maxParticipants} spots
                      filled)
                    </p>
                  )}
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {price === 0 ? "Free" : `$${price.toFixed(2)}`}
                </span>
              </div>
              {spotsLeft !== null && spotsLeft > 0 && (
                <p className="text-sm text-gray-600">
                  {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
                </p>
              )}
            </div>
            {/* RSVP Dialog */}
            <RSVPDialog event={event} user={user} />
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="space-y-3 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Report Link */}
        <div className="py-4">
          <button className="text-[#5D5FEF] hover:text-[#EF5DA8] text-sm font-medium">
            Report this event
          </button>
        </div>
      </div>

      {/* Checkout Dialog*/}
      <CheckoutDialog
        event={event}
        user={user}
        quantity={checkoutQuantity}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onCloseParent={() => setIsJoinModalOpen(false)}
        alreadyRegistered={alreadyRegistered}
        registeredNameProp={fullName}
      />

      {/* Related Events */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <RelatedEvents events={relatedEvents} />
      </div>
    </div>
  );
}
