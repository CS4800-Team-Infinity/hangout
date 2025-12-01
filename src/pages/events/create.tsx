"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LocationInput from "@/components/LocationInput";
import { Map, APIProvider } from "@vis.gl/react-google-maps";

type SuggestItem = {
  id: string;
  label: string;
  city: string;
  lat: string;
  lon: string;
};

type Step = "build" | "tickets" | "publish";

interface EventFormData {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    coordinates: [number, number] | null;
  };
  overview: string;
  hostInfo: string;
  lineup: string;
  maxParticipants?: number;
  isPublic: boolean;
  requiresRSVP: boolean;
  imageUrl?: string;
  tags: string[];
}

const CATEGORIES = [
  "Networking",
  "Tech",
  "Social",
  "Food & Drink",
  "Hobbies & Passion",
  "Travel & Outdoor",
];

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("build");
  const [activeSection, setActiveSection] = useState<string>("title");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 34.0522,
    lng: -118.2437,
  });
  const [selectedLocation, setSelectedLocation] = useState<SuggestItem | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: {
      address: "",
      coordinates: null,
    },
    overview: "",
    hostInfo: "",
    lineup: "",
    maxParticipants: undefined,
    isPublic: true,
    requiresRSVP: false,
    imageUrl: "",
    tags: [],
  });

  useEffect(() => {
    // Only redirect if auth check is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Auto-detect which step user is on based on form completion
  useEffect(() => {
    const hasBasicInfo =
      formData.title && formData.date && formData.location.address;
    const hasTicketsInfo =
      formData.maxParticipants !== undefined || formData.requiresRSVP;

    if (!hasBasicInfo) {
      setCurrentStep("build");
    } else if (!hasTicketsInfo) {
      setCurrentStep("tickets");
    } else {
      setCurrentStep("publish");
    }
  }, [formData]);

  const handleLocationSelect = (selected: SuggestItem) => {
    setSelectedLocation(selected);
    const lat = parseFloat(selected.lat);
    const lng = parseFloat(selected.lon);

    // Validate that coordinates are valid numbers
    if (isNaN(lat) || isNaN(lng)) {
      console.error("Invalid coordinates received:", {
        lat: selected.lat,
        lon: selected.lon,
      });
      alert(
        "Invalid location coordinates. Please try selecting a different location."
      );
      return;
    }

    setMapCenter({ lat, lng });
    setFormData((prev) => ({
      ...prev,
      location: {
        address: selected.label,
        coordinates: [lng, lat],
      },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, we'll use a placeholder. In production, upload to cloud storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.date || !formData.location.address) {
      alert("Please fill in all required fields: Title, Date, and Location");
      return;
    }

    if (!formData.startTime) {
      alert("Please provide a start time");
      return;
    }

    if (!formData.location.coordinates) {
      alert("Please select a location from the dropdown suggestions");
      return;
    }

    // Validate coordinates are actual numbers
    const [lng, lat] = formData.location.coordinates;
    if (
      typeof lng !== "number" ||
      typeof lat !== "number" ||
      isNaN(lng) ||
      isNaN(lat)
    ) {
      alert(
        "Invalid location coordinates. Please select a location from the dropdown suggestions."
      );
      return;
    }

    setIsPublishing(true);

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Combine date and time
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);

      // Use overview as description if description is empty, or combine them
      const description = formData.description || formData.overview || "";

      const eventData = {
        title: formData.title,
        description: description,
        date: startDateTime.toISOString(),
        location: {
          address: formData.location.address,
          coordinates: formData.location.coordinates,
        },
        overview: formData.overview,
        hostInfo: formData.hostInfo,
        lineup: formData.lineup,
        tags: formData.tags,
        maxParticipants: formData.maxParticipants,
        isPublic: formData.isPublic,
        requiresRSVP: formData.requiresRSVP,
        imageUrl:
          formData.imageUrl ||
          "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to event detail page using UUID or ID
        const eventId =
          result.event.uuid || result.event.id || result.event._id;
        router.push(`/events/${eventId}`);
      } else {
        alert(result.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const getStepProgress = (step: Step): number => {
    if (step === "build") {
      const fields = [formData.title, formData.date, formData.location.address];
      return (fields.filter(Boolean).length / fields.length) * 100;
    }
    if (step === "tickets") {
      return formData.maxParticipants !== undefined || formData.requiresRSVP
        ? 100
        : 0;
    }
    return 0;
  };

  // Show nothing while auth is loading, or if user is not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Left Sidebar - Responsive */}
        <div
          className={`w-64 bg-white border-r border-gray-200 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto z-40 transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          <div className="p-6 space-y-6">
            {/* Navigation Icons */}
            <div className="space-y-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-700 hover:text-[#5D5FEF]"
              >
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
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="text-sm font-medium">Home</span>
              </Link>
              <Link
                href="/events"
                className="flex items-center gap-2 text-gray-700 hover:text-[#5D5FEF]"
              >
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
                <span className="text-sm font-medium">Events</span>
              </Link>
            </div>

            {/* Back Link */}
            <Link
              href="/events"
              className="text-sm text-[#5D5FEF] hover:underline"
            >
              ← Back to events
            </Link>

            {/* Event Title Card */}
            <Card className="border-1 border-gray-200 bg-white text-black">
              <CardHeader>
                <CardTitle className="text-sm">Event Title</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="border-1 border-gray-300 text-sm"
                />
                <Input
                  placeholder="Add a short sentence about your event"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="border-1 border-gray-300 text-sm"
                />
                <select className="w-full text-sm text-gray-400 border-1 border-gray-300 rounded-md px-2 py-1">
                  <option>Draft</option>
                </select>
              </CardContent>
            </Card>

            {/* Steps */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Steps</h3>

              {/* Build Event Page Step */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative w-6 h-6">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#E5E7EB"
                        strokeWidth="2"
                        fill="none"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#5D5FEF"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 10}`}
                        strokeDashoffset={`${
                          2 *
                          Math.PI *
                          10 *
                          (1 - getStepProgress("build") / 100)
                        }`}
                        transform="rotate(-90 12 12)"
                      />
                    </svg>
                    {getStepProgress("build") === 100 && (
                      <svg
                        className="absolute top-0 left-0 w-6 h-6 text-[#5D5FEF]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      currentStep === "build"
                        ? "font-semibold text-[#5D5FEF]"
                        : "text-gray-600"
                    }`}
                  >
                    Build event page
                  </span>
                </div>
                <p className="text-xs text-gray-500 ml-9">
                  Provide all the event info and give attendees a clear idea of
                  what to expect.
                </p>
              </div>

              {/* Add Tickets Step */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative w-6 h-6">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#E5E7EB"
                        strokeWidth="2"
                        fill="none"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#5D5FEF"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 10}`}
                        strokeDashoffset={`${
                          2 *
                          Math.PI *
                          10 *
                          (1 - getStepProgress("tickets") / 100)
                        }`}
                        transform="rotate(-90 12 12)"
                      />
                    </svg>
                    {getStepProgress("tickets") === 100 && (
                      <svg
                        className="absolute top-0 left-0 w-6 h-6 text-[#5D5FEF]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      currentStep === "tickets"
                        ? "font-semibold text-[#5D5FEF]"
                        : "text-gray-600"
                    }`}
                  >
                    Add tickets
                  </span>
                </div>
                <p className="text-xs text-gray-500 ml-9">
                  Let attendees know how many people can join and how tickets
                  work for your event.
                </p>
              </div>

              {/* Publish Step */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative w-6 h-6">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#E5E7EB"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-sm ${
                      currentStep === "publish"
                        ? "font-semibold text-[#5D5FEF]"
                        : "text-gray-600"
                    }`}
                  >
                    Publish
                  </span>
                </div>
                <p className="text-xs text-gray-500 ml-9">
                  Save as draft to finish later, publish to go live, or cancel
                  to return to your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:ml-64 flex-1 p-4 md:p-8 pt-24 mt-16">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Event Image */}
            <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={
                  formData.imageUrl ||
                  "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop"
                }
                alt="Event"
                fill
                className="object-cover"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 hover:cursor-pointer"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Event Title Section */}
            <Card className="border-1 border-gray-200 bg-white text-black">
              <CardHeader>
                <CardTitle>Event Title</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Enter event title"
                  value={formData.title}
                  className="border-1 border-gray-300"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
                <Input
                  placeholder="Add a short sentence about your event"
                  value={formData.description}
                  className="border-1 border-gray-300"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </CardContent>
            </Card>

            {/* Date and Time / Location Section */}
            <Card className="border-1 border-gray-200 bg-white text-black">
              <CardHeader>
                <CardTitle>Date and time / Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Date and time
                    </label>
                    <div className="mt-2 space-y-2">
                      <Input
                        type="date"
                        value={formData.date}
                        className="border-1 border-gray-300"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                      />
                      <div className="flex gap-2">
                        <Input
                          type="time"
                          placeholder="Start time"
                          value={formData.startTime}
                          className="border-1 border-gray-300"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                        />
                        <Input
                          type="time"
                          placeholder="End time"
                          value={formData.endTime}
                          className="border-1 border-gray-300"
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <div className="mt-2 border-1 border-gray-300 rounded-md">
                      <LocationInput
                        value={formData.location.address}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: { ...prev.location, address: value },
                          }))
                        }
                        onSelect={handleLocationSelect}
                        placeholder="Enter a location"
                      />
                    </div>
                  </div>
                </div>
                {formData.location.coordinates && (
                  <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                    {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                      <APIProvider
                        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                      >
                        <Map
                          defaultCenter={mapCenter}
                          defaultZoom={13}
                          mapId="hangout-create-map"
                          style={{ width: "100%", height: "100%" }}
                        />
                      </APIProvider>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <p className="text-gray-400 text-sm">
                          Map preview unavailable
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overview Section */}
            <Card className="border-1 border-gray-200 bg-white text-black">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Use this section to share extra details about your event, such as key information, venue specifics, accessibility options, or anything else that will help attendees prepare."
                  value={formData.overview}
                  className="border-1 border-gray-300"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      overview: e.target.value,
                    }))
                  }
                  rows={6}
                />
              </CardContent>
            </Card>

            {/* Host Info Section */}
            <Card className="border-1 border-gray-200 bg-white text-black">
              <CardHeader>
                <CardTitle>Host Info</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Tell participants a little about yourself or your group."
                  className="border-1 border-gray-300"
                  value={formData.hostInfo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hostInfo: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Lineup Section */}
            <Card className="border-1 border-gray-200 bg-white text-black">
              <CardHeader>
                <CardTitle>Lineup</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Showcase your special guests by adding a dedicated section to your event page. Customize the section title to match your event theme, and include details about each guest. You can also mark someone as a headliner to give them extra spotlight."
                  value={formData.lineup}
                  className="border-1 border-gray-300"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lineup: e.target.value }))
                  }
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Capacity & Tickets Section */}
            <Card className="border-1 border-gray-200 bg-white text-black">
              <CardHeader>
                <CardTitle>Capacity & Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* <Textarea
                  placeholder="In this section, you can set the capacity and ticketing options for your event. Choose whether to limit the number of guests or leave it open, and decide if tickets will be free, paid, or donation-based. You can also require attendees to RSVP to confirm their spot."
                  rows={3}
                  readOnly
                  className="border-1 border-gray-300"
                /> */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-700">
                      Maximum Participants
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Leave empty for unlimited"
                      value={formData.maxParticipants || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxParticipants: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        }))
                      }
                      className="mt-1 border-1 border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requiresRSVP"
                      checked={formData.requiresRSVP}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          requiresRSVP: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="requiresRSVP"
                      className="text-sm text-gray-700"
                    >
                      Require RSVP
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <label
                        htmlFor="isPublic"
                        className="text-sm font-medium text-gray-900"
                      >
                        Event Visibility
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        {formData.isPublic
                          ? "Public - Anyone can find and view this event"
                          : "Private - Only invited people can see this event"}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.isPublic}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          isPublic: !prev.isPublic,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5D5FEF] focus:ring-offset-2 ${
                        formData.isPublic ? "bg-[#5D5FEF]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.isPublic ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags / Category Section */}
            <Card className="border-1 border-gray-200 bg-white text-black">
              <CardHeader>
                <CardTitle>Tags / Category</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Add tags or select a category to help people find your event
                  more easily.
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleTagToggle(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors hover:cursor-pointer ${
                        formData.tags.includes(category)
                          ? "bg-[#5D5FEF] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Publish Event Button */}
            <div className="flex justify-end pt-6">
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                className="bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] text-white hover:from-[#EF5DA8] hover:to-[#5D5FEF]"
              >
                {isPublishing ? "Publishing..." : "Publish Event"}
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
