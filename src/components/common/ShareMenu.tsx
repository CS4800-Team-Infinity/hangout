import { useEffect, useRef, useState } from "react";
import { Facebook, Linkedin, Link, X, Mail } from "lucide-react";
import Image from "next/image";

type ShareMenuProps = {
  eventId?: string;
  title: string;
  onClose?: () => void;
};

export default function ShareMenu({ eventId, title, onClose }: ShareMenuProps) {
  const [eventUrl, setEventUrl] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEventUrl(
        eventId
          ? `${window.location.origin}/events/${eventId}`
          : window.location.href
      );
    }
  }, [eventId]);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [onClose]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    navigator.clipboard.writeText(eventUrl);
    alert("Link copied!");
    onClose?.();
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    onClose?.();
  };

  return (
    <div
      className="absolute  top-1/2 left-full -translate-y-1/2 mb-12 ml-3 w-64 bg-white rounded-xl border shadow-lg p-4 z-[99999]"
      onClick={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
      }}
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose?.();
        }}
        aria-label="Close share menu"
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
      >
        <X size={16} />
      </button>

      <h4 className="text-sm font-semibold mb-3 text-gray-700">
        Share this event
      </h4>

      <div className="grid grid-cols-3 gap-3">
        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex flex-col items-center text-xs text-gray-500 hover:text-black"
        >
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center mb-1 text-gray-700 hover:text-black hover:border-gray-500">
            <Link size={16} />
          </div>
          Copy link
        </button>

        {/* LinkedIn */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            openShareWindow(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                eventUrl
              )}`
            );
          }}
          className="flex flex-col items-center text-xs text-gray-500 hover:text-black"
        >
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center mb-1 text-gray-700 hover:text-black hover:border-gray-500">
            <Linkedin size={16} />
          </div>
          LinkedIn
        </button>

        {/* Facebook */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            openShareWindow(
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                eventUrl
              )}`
            );
          }}
          className="flex flex-col items-center text-xs text-gray-500 hover:text-black"
        >
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center mb-1 text-gray-700 hover:text-black hover:border-gray-500">
            <Facebook size={16} />
          </div>
          Facebook
        </button>

        {/* Instagram */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            navigator.clipboard.writeText(eventUrl);
            alert("Link copied! You can now share it on Instagram.");
            window.open("https://www.instagram.com/", "_blank");
            onClose?.();
          }}
          className="flex flex-col items-center text-xs text-gray-500 hover:text-black"
        >
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center mb-1 text-gray-700 hover:text-black hover:border-gray-500">
            <Image
              src="/icons/instagram.svg"
              alt="Instagram"
              width={16}
              height={16}
            />
          </div>
          Instagram
        </button>

        {/* X (Twitter) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            openShareWindow(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Check out this event: ${title}`
              )}&url=${encodeURIComponent(eventUrl)}`
            );
          }}
          className="flex flex-col items-center text-xs text-gray-500 hover:text-black"
        >
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center mb-1 text-gray-700 hover:text-black hover:border-gray-500">
            <X size={16} />
          </div>
          X
        </button>

        {/* Email */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            openShareWindow(
              `mailto:?subject=${encodeURIComponent(
                `Check out this event: ${title}`
              )}&body=${encodeURIComponent(eventUrl)}`
            );
          }}
          className="flex flex-col items-center text-xs text-gray-500 hover:text-black"
        >
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center mb-1 text-gray-700 hover:text-black hover:border-gray-500">
            <Mail size={16} />
          </div>
          Email
        </button>
      </div>
    </div>
  );
}
