import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { EventDetails } from "@/types/EventDetails";

interface User {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  name?: string;
}

interface CheckoutDialogProps {
  event: EventDetails;
  user?: User | null;
  quantity: number;
  isOpen: boolean;
  onClose: () => void;
  onCloseParent: () => void;

  alreadyRegistered?: boolean;
  registeredNameProp?: string;
}

export default function CheckoutDialog({
  event,
  user,
  quantity,
  isOpen,
  onClose,
  onCloseParent,
  alreadyRegistered = false,
  registeredNameProp = "",
}: CheckoutDialogProps) {
  const router = useRouter();
  const [localUser, setLocalUser] = useState<User | null>(user ?? null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [keepUpdated, setKeepUpdated] = useState(true);
  const [sendEmails, setSendEmails] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200);
  const [hasRegistered, setHasRegistered] = useState(alreadyRegistered);
  const [registeredName, setRegisteredName] = useState(registeredNameProp);
  const [successMessage, setSuccessMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  // Update form when user data changes
  useEffect(() => {
    setLocalUser(user ?? null);
  }, [user]);

  // Load the full user data from the backend
  useEffect(() => {
    async function fetchFullUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.log("Failed to load user profile");
          return;
        }

        const data = await res.json();

        if (data.user) {
          setLocalUser(data.user);
        }
      } catch (err) {
        console.error("Error loading user profile", err);
      }
    }
    if (!localUser || !localUser._id) {
      fetchFullUser();
    }
  }, [localUser]);

  useEffect(() => {
    console.log("Checkout localUser:", localUser);
    if (localUser) {
      setFullName(localUser.name || "");
      setEmail(localUser.email || "");
      setConfirmEmail(localUser.email || "");
    } else {
      setFullName("");
      setEmail("");
      setConfirmEmail("");
    }
  }, [localUser]);

  const startBackToEventCountdown = (eventId: string) => {
    let time = 3;
    setCountdown(time);

    const interval = setInterval(() => {
      time -= 1;
      setCountdown(time);

      if (time === 0) {
        clearInterval(interval);
        onClose();
        onCloseParent && onCloseParent();
      }
    }, 1000);
  };

  const handleRegister = async () => {
    try {
      const userId = localUser?._id;
      const eventId = event?._id || event?.id;

      console.log("Using eventId:", eventId);

      if (!userId || !eventId) {
        console.log("❌ Missing userId or eventId");
        alert("Please log in to register for this event.");
        return;
      }

      const res = await fetch("/api/rsvp/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, hangoutId: eventId }),
      });

      let data;
      try {
        const text = await res.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
      }

      // Already registered
      if (res.status === 409) {
        setHasRegistered(true);
        setRegisteredName(localUser?.name || "");
        setSuccessMessage("You are already registered for this event.");
        return startBackToEventCountdown(eventId);
      }

      if (!res.ok) {
        alert("Failed to register. Please try again.");
        return;
      }

      // Success
      setHasRegistered(true);
      setRegisteredName(localUser?.name || "");
      setSuccessMessage("You have successfully registered for this event!");
      return startBackToEventCountdown(eventId);
    } catch (err) {
      console.error("RSVP error", err);
      alert("An error occurred. Please try again.");
    }
  };

  const handleLogin = () => {
    const eventId = event._id;
    const currentUrl = window.location.origin + window.location.pathname;
    const redirectUrl = `${currentUrl}?checkout=true&quantity=${quantity}`;
    window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleSignup = () => {
    const eventId = event._id;
    const currentUrl = window.location.origin + window.location.pathname;
    const redirectUrl = `${currentUrl}?checkout=true&quantity=${quantity}`;
    window.location.href = `/signup?redirect=${encodeURIComponent(
      redirectUrl
    )}`;
  };

  useEffect(() => {
    if (!localUser?._id || !event?._id || !isOpen) return;

    async function checkRSVP() {
      try {
        const res = await fetch(
          `/api/rsvp/check?eventId=${event._id}&userId=${localUser?._id}`
        );

        if (!res.ok) {
          console.log("Could not check RSVP status");
          return;
        }

        const text = await res.text();
        if (!text) {
          console.log("Empty response from RSVP check");
          return;
        }

        const data = JSON.parse(text);

        if (data.already) {
          setHasRegistered(true);
        }
      } catch (error) {
        console.error("Error checking RSVP:", error);
      }
    }

    checkRSVP();
  }, [event, localUser, isOpen]);

  // Timer logic
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[1200px] !w-[95vw] max-h-[90vh] p-0 rounded-xl overflow-auto bg-white">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] min-h-full">
          {/* LEFT SIDE */}
          <div className="p-6 md:p-12 flex flex-col min-h-[500px]">
            <button
              onClick={onClose}
              className="text-gray-600 text-lg mb-6 self-start hover:text-gray-800"
            >
              ← Back
            </button>

            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-black">
              Checkout
            </h2>

            <p className="text-sm md:text-base text-gray-500 mb-8">
              Time left {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </p>

            <hr className="mb-8 border-gray-300" />

            {/* Event Summary */}
            <div className="flex gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
              <img
                src={event.imageUrl || "/images/placeholder.png"}
                alt={event.title}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-sm md:text-base mb-1 line-clamp-2">
                  {event.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  ·{" "}
                  {new Date(event.date).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-sm font-semibold mt-2">$0.00</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-black">
                  Contact information
                </h3>
                <span className="text-sm text-[#EF5DA8]">* Required</span>
              </div>

              {/* Logged in user */}
              {localUser ? (
                <div className="mb-4 text-sm text-gray-700">
                  Logged in as{" "}
                  <span className="font-semibold">{localUser.email}</span>.
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      setLocalUser(null);
                      setFullName("");
                      setEmail("");
                      setConfirmEmail("");
                    }}
                    className="text-[#5D5FEF] hover:underline ml-1"
                  >
                    Not you?
                  </button>
                </div>
              ) : (
                <div className="mb-4 text-sm">
                  <button
                    onClick={handleLogin}
                    className="text-[#5D5FEF] hover:underline font-medium"
                  >
                    Log in
                  </button>
                  <span className="text-gray-600">
                    {" "}
                    for a faster experience.{" "}
                  </span>
                  <button
                    onClick={handleSignup}
                    className="text-[#5D5FEF] hover:underline font-medium"
                  >
                    Sign up
                  </button>
                  <span className="text-gray-600">
                    {" "}
                    if you don't have an account.
                  </span>
                </div>
              )}

              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-black">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Full name <span className="text-[#EF5DA8]">*</span>
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="w-full"
                    disabled={!!localUser}
                  />
                </div>
              </div>

              {/* Email fields if no user */}
              {!localUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-black">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Email address <span className="text-[#EF5DA8]">*</span>
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      Confirm email <span className="text-[#EF5DA8]">*</span>
                    </label>
                    <Input
                      type="email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="Confirm email"
                      className="w-full text-black"
                    />
                  </div>
                </div>
              )}

              {/* Email field for logged in user */}
              {localUser && (
                <div className="mb-4">
                  <label className="block text-sm mb-2 text-gray-700">
                    Email address <span className="text-[#EF5DA8]">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={email}
                      placeholder="Email address"
                      disabled
                      className="w-full pr-10 bg-gray-50 text-black"
                    />
                  </div>
                </div>
              )}

              {/* Checkboxes */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="keep-updated"
                    checked={keepUpdated}
                    onCheckedChange={(checked) =>
                      setKeepUpdated(checked as boolean)
                    }
                    className="border-gray-400 data-[state=unchecked]:bg-white 
                    data-[state=unchecked]:border-gray-400
                    data-[state=checked]:bg-indigo-600 
                    data-[state=checked]:border-indigo-600"
                  />
                  <label
                    htmlFor="keep-updated"
                    className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                  >
                    Keep me updated on more events and news from this event
                    organizer.
                  </label>
                </div>

                <div className="flex items-start gap-3 text-black">
                  <Checkbox
                    id="send-emails"
                    checked={sendEmails}
                    onCheckedChange={(checked) =>
                      setSendEmails(checked as boolean)
                    }
                    className="border-gray-400 data-[state=unchecked]:bg-white 
                    data-[state=unchecked]:border-gray-400
                    data-[state=checked]:bg-indigo-600 
                    data-[state=checked]:border-indigo-600"
                  />
                  <label
                    htmlFor="send-emails"
                    className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                  >
                    Send me emails about the best events happening nearby or
                    online.
                  </label>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-6">
                By selecting Register, I agree to the{" "}
                <a
                  href="/term-of-use"
                  className="text-[#5D5FEF] hover:underline"
                >
                  Hangout Terms of Service
                </a>
              </p>

              <div className="space-y-4 mt-4">
                {/* Success or Already Registered message */}
                {successMessage && (
                  <div className="mt-4 p-4 rounded-md border border-[#5D5FEF] bg-[#5D5FEF]/10 text-[#5D5FEF]">
                    <p>{successMessage}</p>
                    {countdown !== null && (
                      <p className="text-sm mt-2">
                        Returning in {countdown}...
                      </p>
                    )}
                  </div>
                )}

                {hasRegistered && !successMessage && (
                  <div className="p-4 bg-green-50 border border-green-300 text-green-800 rounded">
                    You are already registered.
                  </div>
                )}

                {!hasRegistered && (
                  <Button
                    onClick={handleRegister}
                    className="w-full bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] text-white text-base md:text-lg py-5 md:py-6 rounded-full hover:opacity-90"
                  >
                    Register
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 flex items-center gap-2">
                Powered by <span className="font-semibold">hangout</span>
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col text-black bg-gray-100 min-h-[500px]">
            <div className="relative h-48 md:h-64">
              <img
                src={event.imageUrl || "images/placeholder.png"}
                alt="Event image"
                className="h-full w-full object-cover"
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/50 rounded-full h-10 w-10 flex items-center justify-center text-white text-xl hover:bg-black/70"
              >
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8 flex-1">
              <h3 className="text-xl md:text-2xl font-bold mb-6">
                Order summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-base">
                  <span>{quantity} × Preregistration</span>
                  <span className="font-semibold">$0.00</span>
                </div>

                <div className="flex justify-between text-base">
                  <div>
                    <div className="font-medium">Delivery</div>
                    <div className="text-sm text-gray-600">1 × eTicket</div>
                  </div>
                  <span className="font-semibold">$0.00</span>
                </div>
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
  );
}
