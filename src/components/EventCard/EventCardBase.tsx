import { Heart, MoreHorizontal, Share2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type Attendee = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type EventCardProps = {
  month?: string;
  day?: string;
  title: string;
  location: string;
  datetime?: string | Date;
  host?: string | { name?: string };
  status?:
    | "upcoming"
    | "ongoing"
    | "completed"
    | "cancelled"
    | "Joined"
    | "Saved"
    | "Just Viewed";
  price?: string;
  imageUrl?: string;
  attendees?: Attendee[];
  imageClassName?: string;
  className?: string;
  actions?: boolean;
  registrationUrl?: string;
  eventId?: string;
  variant?: "list" | "home";
};

export default function EventCardBase({
  month,
  day,
  title,
  location,
  datetime,
  host,
  status: initialStatus = "Just Viewed",
  price = "Free",
  imageUrl,
  attendees = [],
  imageClassName,
  className = "",
  actions = true,
  registrationUrl,
  eventId,
  variant = "list",
}: EventCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState(initialStatus);
  const [saved, setSaved] = useState(status === "Saved");
  const [isSharing, setIsSharing] = useState(false);

  const formattedDate = datetime
    ? (() => {
        const dateObj =
          typeof datetime === "string" ? new Date(datetime) : datetime;
        if (isNaN(dateObj.getTime())) return "Invalid date";
        return dateObj.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      })()
    : "Date not available";

  const dateObj = datetime ? new Date(datetime) : null;
  const displayMonth =
    month ||
    (dateObj
      ? dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase()
      : "");
  const displayDay = day || (dateObj ? dateObj.getDate().toString() : "");

  const hostName =
    typeof host === "string" ? host : host?.name ?? "Unknown Host";

  const isOnline = location?.toLowerCase().includes("online");
  const locationBadge = isOnline ? "Online" : "Offline";

  const handleCardClick = () => {
    if (eventId) {
      window.location.href = `/events/${eventId}`;
    }
  };

  const handleJoin = () => {
    setStatus("Joined");
    setSaved(false);
    if (registrationUrl) {
      window.open(registrationUrl, "_blank");
    } else if (eventId) {
      window.location.href = `/events/${eventId}`;
    }
    setMenuOpen(false);
  };

  const handleLeave = () => {
    setStatus("Just Viewed");
    setMenuOpen(false);
  };

  const handleViewDetails = () => {
    if (eventId) {
      window.location.href = `/events/${eventId}`;
    }
    setMenuOpen(false);
  };

  const handleToggleFavorite = async () => {
    if (status === "Joined") return;
    try {
      const newSavedState = !saved;
      setSaved(newSavedState);
      setStatus(newSavedState ? "Saved" : "Just Viewed");

      await fetch(`/api/events/${eventId}/favorite`, {
        method: newSavedState ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
    } catch (error) {
      console.error("Error updating favorite:", error);
      setSaved(!saved);
      setStatus(saved ? "Saved" : "Just Viewed");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;

      const target = e.target as Node;
      if (menuRef.current.contains(target)) return;
      if ((target as HTMLElement).closest("button")) return;

      setMenuOpen(false);
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div
      className={`relative rounded-xl border bg-transparent shadow-sm overflow-visible ${
        menuOpen ? "z-[9999]" : ""
      } ${className}`}
    >
      {variant === "home" ? (
        // --- HOME STYLE ---
        <div className="flex flex-col">
          <div className="relative">
            <img
              src={imageUrl || "/placeholder.jpg"}
              alt={title}
              className="w-full h-40 object-cover rounded-t-xl"
            />
            {actions && (
              <button
                type="button"
                aria-label={saved ? "Unsave Event" : "Save Event"}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleToggleFavorite();
                }}
                className="absolute top-2 right-2 bg-white/80 p-1 rounded-full"
              >
                <Heart
                  size={18}
                  className={
                    saved ? "fill-purple-500 text-purple-500" : "text-gray-700"
                  }
                />
              </button>
            )}
          </div>

          <div className="p-3 flex flex-col gap-1">
            <p className="text-xs text-gray-500 flex items-center gap-2">
              {formattedDate}
              <span
                className={`px-2 py-0.5 border rounded-full text-xs ${
                  isOnline
                    ? "text-green-600 border-green-600"
                    : "text-gray-600 border-gray-400"
                }`}
              >
                {locationBadge}
              </span>
            </p>
            <h3 className="font-semibold text-black line-clamp-2">{title}</h3>
            <p className="text-xs text-gray-600">by {hostName}</p>

            <div className="flex items-center justify-between mt-2">
              {attendees.length > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {attendees.slice(0, 3).map((attendee) => (
                      <img
                        key={attendee.id}
                        src={attendee.avatarUrl}
                        alt={attendee.name}
                        className="w-6 h-6 rounded-full border"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {attendees.length} attendee
                    {attendees.length > 1 ? "s" : ""}
                  </span>
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2 text-gray-600">
                {/* Share */}
                <button
                  type="button"
                  aria-label="Share Event"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setMenuOpen(false);
                    if (isSharing) return;
                    setIsSharing(true);
                    if (navigator.share) {
                      navigator.share({
                        title,
                        text: `Check out this event: ${title}`,
                        url: eventId
                          ? `${window.location.origin}/events/${eventId}`
                          : window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(
                        eventId
                          ? `${window.location.origin}/events/${eventId}`
                          : window.location.href
                      );
                      alert("Event link copied!");
                    }
                  }}
                >
                  <Share2 size={18} />
                </button>

                {/* More actions */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    aria-label="More Actions"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsSharing(false);
                      setMenuOpen((prev) => !prev);
                    }}
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-[10000]">
                      <ul className="text-sm relative z-[10000]">
                        <li
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleViewDetails();
                            setMenuOpen(false);
                          }}
                        >
                          View Details
                        </li>
                        {status !== "Joined" && (
                          <li
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleJoin();
                              setMenuOpen(false);
                            }}
                          >
                            Join Event
                          </li>
                        )}
                        {status === "Joined" && (
                          <li
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleLeave();
                              setMenuOpen(false);
                            }}
                          >
                            Leave Event
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // --- LIST STYLE ---
        <div className="flex flex-col w-full min-h-[140px] p-3">
          <div className="flex items-center gap-2 md:gap-3 pl-1">
            <div className="flex flex-col items-center justify-center w-8 md:w-10 font-bold shrink-0">
              <span className="uppercase text-sm bg-gradient-to-r from-[#7879F1] to-[#F178B6] bg-clip-text text-transparent">
                {displayMonth}
              </span>
              <span className="text-lg text-black">{displayDay}</span>
            </div>

            <img
              src={imageUrl || "/placeholder.jpg"}
              alt={title}
              className={`rounded-md object-cover my-2 md:my-0 ${
                imageClassName ?? "w-32 h-20 sm:w-40 sm:h-24 md:w-24 md:h-16"
              }`}
            />

            <div className="hidden md:flex flex-col justify-center ml-2 flex-1">
              <h3 className="font-semibold text-black text-base">{title}</h3>
              <p className="text-sm text-gray-600">{location}</p>
              <p className="text-xs text-gray-500">{formattedDate}</p>
            </div>
          </div>

          <div className="flex flex-col md:hidden mt-2">
            <h3 className="font-semibold text-black text-sm sm:text-base">
              {title}
            </h3>
            <p className="text-xs text-gray-600">{location}</p>
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-700 mt-3 flex-wrap gap-2">
            <div className="flex gap-6 md:gap-8">
              <span className="hidden md:inline">Host: {hostName}</span>
              <span>Status: {status}</span>
              <span>{price === "Free" ? "Free" : `$${price}`}</span>
            </div>

            {actions && (
              <div className="flex gap-2 text-gray-600 relative z-10">
                <button
                  type="button"
                  aria-label={saved ? "Unsave Event" : "Save Event"}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleToggleFavorite();
                  }}
                >
                  <Heart
                    size={16}
                    className={
                      status === "Joined"
                        ? "opacity-40 cursor-not-allowed"
                        : saved
                        ? "fill-purple-500 text-purple-500"
                        : ""
                    }
                  />
                </button>

                <button
                  type="button"
                  aria-label="Share Event"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setMenuOpen(false);
                    if (navigator.share) {
                      navigator.share({
                        title,
                        text: `Check out this event: ${title}`,
                        url: eventId
                          ? `${window.location.origin}/events/${eventId}`
                          : window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(
                        eventId
                          ? `${window.location.origin}/events/${eventId}`
                          : window.location.href
                      );
                      alert("Event link copied!");
                    }
                  }}
                >
                  <Share2 size={16} />
                </button>

                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    aria-label="More Actions"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsSharing(false);
                      setMenuOpen((prev) => !prev);
                    }}
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-[10000]">
                      <ul className="text-sm relative z-[10000]">
                        <li
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleViewDetails();
                            setMenuOpen(false);
                          }}
                        >
                          View Details
                        </li>
                        {status !== "Joined" && (
                          <li
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleJoin();
                              setMenuOpen(false);
                            }}
                          >
                            Join Event
                          </li>
                        )}
                        {status === "Joined" && (
                          <li
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleLeave();
                              setMenuOpen(false);
                            }}
                          >
                            Leave Event
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
