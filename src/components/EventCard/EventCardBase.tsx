import { Heart, MoreHorizontal, Share2 } from "lucide-react";
import { useState } from "react";

export type Attendee = {
    id: string;
    name: string;
    avatarUrl: string;
};

export type EventCardProps = {
    month: string;
    day: string;
    title: string;
    location: string;
    datetime: string;
    host: string;
    status: "Joined" | "Saved" | "Just Viewed";
    price: string;
    imageUrl: string;
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
    status: initialStatus,
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
    const [menuOpen, setMenuOpen] = useState(false);
    const [status, setStatus] = useState(initialStatus);
    const [saved, setSaved] = useState(status === "Saved");

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

    const toggleSave = () => {
        if (status === "Joined") return;
        if (saved) {
            setSaved(false);
            setStatus("Just Viewed");
        } else {
            setSaved(true);
            setStatus("Saved");
        }
    };

    return (
        <div
            className={`relative rounded-xl border bg-transparent shadow-sm ${className}`}
        >
            {variant === "home" ? (
                <div className="flex flex-col">
                    {/* Image with Save button */}
                    <div className="relative">
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-full h-40 object-cover rounded-t-xl"
                        />
                        {actions && (
                            <button
                                type="button"
                                aria-label={saved ? "Unsave Event" : "Save Event"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSave();
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

                    {/* Content */}
                    <div className="p-3 flex flex-col gap-1">
                        {/* Datetime + Online */}
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                            {datetime}
                            <span className="px-2 py-0.5 border rounded-full text-xs">
                                Online
                            </span>
                        </p>

                        {/* Title */}
                        <h3 className="font-semibold text-black line-clamp-2">{title}</h3>

                        {/* Host */}
                        <p className="text-xs text-gray-600">by {host}</p>

                        {/* Attendees */}
                        {attendees.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex -space-x-2">
                                    {attendees.slice(0, 3).map((attendee) => (
                                        <img
                                            key={attendee.id}
                                            src={attendee.avatarUrl}
                                            alt={attendee.name}
                                            className="w-6 h-6 rounded-full border"
                                        />
                                    ))}
                                    {attendees.length > 3 && (
                                        <span className="text-xs text-gray-500 ml-2">
                                            +{attendees.length - 3} more
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {attendees.length} attendee
                                    {attendees.length > 1 ? "s" : ""}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (

                // --- LIST STYLE ---
                <div className="flex w-full min-h-[140px]">
                    {/* Date box */}
                    <div className="flex flex-col items-center justify-center w-20 font-bold">
                        <span className="uppercase text-xl bg-gradient-to-r from-[#7879F1] to-[#F178B6] bg-clip-text text-transparent">
                            {month}
                        </span>
                        <span className="text-xl text-black">{day}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3 flex flex-col">
                        <div className="flex gap-3">
                            <img
                                src={imageUrl}
                                alt={title}
                                className={`rounded object-cover ${imageClassName ?? "w-24 h-16"
                                    }`}
                            />
                            <div>
                                <h3 className="font-semibold text-black">{title}</h3>
                                <p className="text-sm text-gray-600">{location}</p>
                                <p className="text-xs text-gray-500">{datetime}</p>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-700 mt-2">
                            <span>Host: {host}</span>
                            <span>Status: {status}</span>
                            <span>{price === "Free" ? "Free" : `$${price}`}</span>
                        </div>

                        {actions && (
                            <div className="flex gap-2 justify-end mt-2 text-gray-600 relative z-10">
                                {/* Heart */}
                                <button
                                    type="button"
                                    aria-label={saved ? "Unsave Event" : "Save Event"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSave();
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

                                {/* Share */}
                                <button
                                    type="button"
                                    aria-label="Share Event"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(
                                            eventId
                                                ? `${window.location.origin}/events/${eventId}`
                                                : window.location.href
                                        );
                                        alert("Event link copied!");
                                    }}
                                >
                                    <Share2 size={16} />
                                </button>

                                {/* More menu */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        aria-label="More Actions"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen((prev) => !prev);
                                        }}
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>

                                    {menuOpen && (
                                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-20">
                                            <ul className="text-sm">
                                                <li
                                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={handleViewDetails}
                                                >
                                                    View Details
                                                </li>
                                                {status !== "Joined" && (
                                                    <li
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={handleJoin}
                                                    >
                                                        Join Event
                                                    </li>
                                                )}
                                                {status === "Joined" && (
                                                    <li
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={handleLeave}
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
