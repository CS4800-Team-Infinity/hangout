import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import CheckoutDialog from "./CheckoutDialog";
import { EventDetails } from "@/types/EventDetails";

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface RSVPPopupProps {
  event: EventDetails;
  user?: User | null;
}

export default function RSVPPopup({ event, user }: RSVPPopupProps) {
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isRSVPOpen, setIsRSVPOpen] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registeredName, setRegisteredName] = useState("");

  useEffect(() => {
    async function check() {
      if (!user?.email || !event?._id) return;

      const res = await fetch(`/api/events/${event._id}/attendees`);
      const data = await res.json();

      const match = data.attendees.find(
        (a: any) =>
          (a.email ?? "").toLowerCase() === (user?.email || "").toLowerCase()
      );

      if (match) {
        setAlreadyRegistered(true);
        setRegisteredName(match.name ?? "");
      } else {
        setAlreadyRegistered(false);
        setRegisteredName("");
      }
    }

    check();
  }, [user?.email, event?._id]);

  const handleJoinEvent = () => {
    setShowCheckout(true);
    setIsRSVPOpen(false); // Close RSVP dialog when opening checkout
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  const handleCloseParent = () => {
    setIsRSVPOpen(false);
    setShowCheckout(false);
  };

  return (
    <>
      <Dialog open={isRSVPOpen} onOpenChange={setIsRSVPOpen}>
        <DialogTrigger asChild>
          <Button
            className="
              bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8]
            hover:from-[#EF5DA8] hover:to-[#5D5FEF]
            text-white px-8 py-6 text-base
              transition-all duration-300
            "
          >
            Get Ticket
          </Button>
        </DialogTrigger>

        <DialogContent className="!max-w-[1200px] !w-[95vw] max-h-[90vh] p-0 rounded-xl overflow-auto bg-white">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] min-h-full">
            {/* LEFT SIDE */}
            <div className="p-6 md:p-12 flex flex-col min-h-[500px]">
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-black leading-tight">
                {event.title}
              </h2>

              <p className="text-sm md:text-base text-gray-700 mb-8">
                Starts on{" "}
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                ·{" "}
                {new Date(event.date).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                PDT
                <span className="ml-3">
                  🔥 Only{" "}
                  {event.maxParticipants
                    ? event.maxParticipants - event.attendeeCount
                    : 0}{" "}
                  spots left
                </span>
              </p>

              <hr className="mb-8 border-gray-300" />

              <div className="border-2 border-pink-400 rounded-2xl p-4 md:p-6 mt-2 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg md:text-xl font-semibold text-black">
                    Preregistration
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      className="border-2 border-gray-800 rounded-full h-8 w-8 md:h-8 md:w-8 flex items-center justify-center text-lg md:text-xl hover:bg-gray-100 text-black"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      −
                    </button>

                    <span className="text-lg md:text-xl font-semibold min-w-[30px] text-center text-black">
                      {quantity}
                    </span>

                    <button
                      className="border-2 border-gray-800 rounded-full h-8 w-8 md:h-8 md:w-8 flex items-center justify-center text-lg md:text-xl hover:bg-gray-100 text-black"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-xl p-4 md:p-5">
                  <p className="text-xl md:text-2xl font-bold mb-1 text-black">
                    Free
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 mb-4">
                    Sales end on{" "}
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>

                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                    Registering for a ticket is required and guarantees your
                    spot. It also helps us confirm your address in advance so
                    the check-in process is faster and smoother at the event.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleJoinEvent}
                className="mt-auto w-full bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] text-white text-base md:text-lg py-5 md:py-6 rounded-full hover:opacity-90"
              >
                Join Event ▼
              </Button>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col text-black bg-gray-100 min-h-[500px]">
              <div className="relative h-48 md:h-80">
                <img
                  src={event.imageUrl || "/images/placeholder.png"}
                  alt="Event image"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-6 md:p-8 flex-1">
                <h3 className="text-xl md:text-2xl font-bold mb-6">
                  Order Summary
                </h3>

                <div className="flex justify-between mb-6 md:text-lg text-black">
                  <span>{quantity} × Preregistration</span>
                  <span className="font-semibold">$0.00</span>
                </div>

                <hr className="my-6 border-gray-300" />

                <div className="flex justify-between font-bold text-xl md:text-2xl">
                  <span>Total</span>
                  <span>
                    {event.price === 0
                      ? "Free"
                      : `$${(event.price * quantity).toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog - Separate from RSVP Dialog */}
      <CheckoutDialog
        event={event}
        user={user}
        quantity={quantity}
        isOpen={showCheckout}
        onClose={handleCloseCheckout}
        onCloseParent={handleCloseParent}
        alreadyRegistered={alreadyRegistered}
        registeredNameProp={registeredName}
      />
    </>
  );
}
