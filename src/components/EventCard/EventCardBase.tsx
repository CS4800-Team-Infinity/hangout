import { Heart, MoreHorizontal, Share2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ShareMenu from "../common/ShareMenu";
import Link from "next/link";

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
  price,
  imageUrl,
  attendees = [],
  imageClassName,
  className = "",
  actions = true,
  registrationUrl,
  eventId,
  variant = "list",
}: EventCardProps) {
  const router = useRouter();
  const actionRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState(initialStatus);
  const [saved, setSaved] = useState(status === "Saved");
  const [shareOpen, setShareOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const isShareClickRef = useRef(false);

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

  const handleJoin = () => {
    setStatus("Joined");
    setSaved(false);
    if (registrationUrl) {
      window.open(registrationUrl, "_blank", "noopener,noreferrer");
    } else if (eventId) {
      router.push(`/events/${eventId}`);
    }
    setActionOpen(false);
  };

  const handleLeave = () => {
    setStatus("Just Viewed");
    setActionOpen(false);
  };

  const handleViewDetails = () => {
    if (eventId) {
      router.push(`/events/${eventId}`);
    }
    setActionOpen(false);
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

  // Close both menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        (shareRef.current && shareRef.current.contains(target)) ||
        (actionRef.current && actionRef.current.contains(target))
      ) {
        return;
      }
      setShareOpen(false);
      setActionOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`relative rounded-xl border bg-transparent shadow-sm overflow-visible ${
        shareOpen || actionOpen ? "z-[9999]" : ""
      } ${className}`}
      onClick={(e) => {
        const target = e.target as HTMLElement;

        // Skip clicks from buttons or menus
        if (
          isShareClickRef.current ||
          target.closest("button") ||
          target.closest(".share-menu") ||
          target.closest(".action-menu")
        ) {
          e.stopPropagation();
          isShareClickRef.current = false;
          return;
        }

        if (eventId) router.push(`/events/${eventId}`);
      }}
    >
      {variant === "home" ? (
        // HOME STYLE
        <div className="relative rounded-xl overflow-visible bg-white cursor-pointer">
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
                      saved
                        ? "fill-purple-500 text-purple-500"
                        : "text-gray-700"
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
                      ? "text-purple-500 border-purple-500"
                      : "text-gray-600 border-gray-400"
                  }`}
                >
                  {locationBadge}
                </span>
              </p>
              <h3 className="font-semibold text-black line-clamp-2">{title}</h3>
              <p className="text-xs text-gray-600">by {hostName}</p>

              <div className="flex items-center justify-between mt-2">
                {attendees.length > 0 && (
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
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <div className="relative share-menu" ref={shareRef}>
                    <button
                      type="button"
                      aria-label="Share Event"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        isShareClickRef.current = true;
                        setShareOpen((prev) => !prev);
                        setActionOpen(false);
                      }}
                      className="hover:text-purple-600 transition-colors"
                    >
                      <Share2 size={18} />
                    </button>
                    {shareOpen && (
                      <div className="absolute right-0 mt-2 z-[9999]">
                        <ShareMenu
                          eventId={eventId}
                          title={title}
                          onClose={() => setShareOpen(false)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="relative action-menu" ref={actionRef}>
                    <button
                      type="button"
                      aria-label="More Actions"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        isShareClickRef.current = true;
                        setActionOpen((prev) => !prev);
                        setShareOpen(false);
                      }}
                      className="hover:text-purple-600 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {actionOpen && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-[9999]">
                        <ul className="text-sm">
                          <li
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleViewDetails();
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
        </div>
      ) : (
        // LIST STYLE
        <div className="relative overflow-visible flex flex-col w-full min-h-[140px] p-3 ">
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
              <span>
                {!price || price.toLowerCase() === "free" ? "Free" : price}
              </span>
            </div>

            <div className="flex items-center gap-3 text-gray-600 z-0">
              <div className="relative share-menu" ref={shareRef}>
                <button
                  type="button"
                  aria-label="Share Event"
                  onClick={(e) => {
                    e.stopPropagation();
                    isShareClickRef.current = true;
                    setShareOpen((prev) => !prev);
                    setActionOpen(false);
                  }}
                  className="hover:text-purple-600 transition-colors"
                >
                  <Share2 size={16} />
                </button>
                {shareOpen && (
                  <div className="absolute right-0 mt-2 z-[9999] ">
                    <ShareMenu
                      eventId={eventId}
                      title={title}
                      onClose={() => setShareOpen(false)}
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                aria-label={saved ? "Unsave Event" : "Save Event"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite();
                }}
                className="hover:text-purple-600 transition-colors"
              >
                <Heart
                  size={16}
                  className={
                    status === "Joined"
                      ? "opacity-40 cursor-not-allowed"
                      : saved
                      ? "fill-purple-500 text-purple-500"
                      : "text-gray-700"
                  }
                />
              </button>

              <div className="relative action-menu" ref={actionRef}>
                <button
                  type="button"
                  aria-label="More Actions"
                  onClick={(e) => {
                    isShareClickRef.current = true;
                    setActionOpen((prev) => !prev);
                    setShareOpen(false);
                  }}
                  className="hover:text-purple-600 transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>

              {actionOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-[9999]">
                  <ul className="text-sm">
                    <li
                      className="menu-item px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails();
                      }}
                    >
                      View Details
                    </li>
                    {status !== "Joined" && (
                      <li
                        className="menu-item px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoin();
                        }}
                      >
                        Join Event
                      </li>
                    )}
                    {status === "Joined" && (
                      <li
                        className="menu-item px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeave();
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
      )}
    </div>
  );
}
