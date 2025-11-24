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

type SuggestItem = {
  id: string;
  label: string;
  city: string;
  lat: string;
  lon: string;
};

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

export default function EditEventPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { user, isAuthenticated, isLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: { address: "", coordinates: null },
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
    if (!id) return;

    const loadEvent = async () => {
      setLoadingEvent(true);
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (data?.event) {
          const e = data.event;

          // parse date into date and startTime
          let dateStr = "";
          let timeStr = "";
          try {
            const d = new Date(e.date);
            if (!isNaN(d.getTime())) {
              dateStr = d.toISOString().slice(0, 10);
              timeStr = d.toISOString().slice(11, 16);
            }
          } catch (err) {
            // ignore
          }

          setFormData({
            title: e.title || "",
            description: e.description || "",
            date: dateStr,
            startTime: timeStr,
            endTime: "",
            location: {
              address: e.location?.address || "",
              coordinates: e.location?.coordinates || null,
            },
            overview: e.overview || "",
            hostInfo: e.hostInfo || "",
            lineup: e.lineup || "",
            maxParticipants: e.maxParticipants ?? undefined,
            isPublic: typeof e.isPublic === "boolean" ? e.isPublic : true,
            requiresRSVP: !!e.requiresRSVP,
            imageUrl: e.imageUrl || "",
            tags: Array.isArray(e.tags) ? e.tags : [],
          });
        } else {
          alert(data?.error || "Failed to load event");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load event.");
      } finally {
        setLoadingEvent(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleLocationSelect = (selected: SuggestItem) => {
    const lat = parseFloat(selected.lat);
    const lon = parseFloat(selected.lon);
    if (isNaN(lat) || isNaN(lon)) {
      alert("Invalid coordinates selected");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      location: { address: selected.label, coordinates: [lon, lat] },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date || !formData.location.address) {
      alert("Please fill in Title, Date and Location");
      return;
    }

    if (!formData.startTime) {
      alert("Please provide a start time");
      return;
    }

    setIsSaving(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");

      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);

      const payload = {
        title: formData.title,
        description: formData.description || formData.overview || "",
        date: startDateTime.toISOString(),
        location: {
          address: formData.location.address,
          coordinates: formData.location.coordinates,
        },
        maxParticipants: formData.maxParticipants,
        isPublic: formData.isPublic,
        imageUrl: formData.imageUrl,
        tags: formData.tags,
      };

      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        const eventId = data.event?.uuid || data.event?._id || id;
        router.push(`/events/${eventId}`);
      } else {
        alert(data.error || "Failed to update event");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update event");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || loadingEvent) return null;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Edit Event</h1>
            <p className="text-sm text-gray-600">Update event details and publish changes</p>
          </div>
          <Link href={`/events/${id}`} className="text-sm text-[#5D5FEF] hover:underline">Cancel</Link>
        </div>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Event Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={formData.imageUrl || "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop"}
                alt="Event"
                fill
                className="object-cover"
              />
              <button onClick={() => fileInputRef.current?.click()} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow">
                Edit
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input placeholder="Title" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} />
              <Input placeholder="Short description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Date & Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Date</label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} />
                <label className="text-sm mt-2">Start time</label>
                <Input type="time" value={formData.startTime} onChange={(e) => setFormData((p) => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm">Location</label>
                <LocationInput
                  value={formData.location.address}
                  onChange={(value) => setFormData((p) => ({ ...p, location: { ...p.location, address: value } }))}
                  onSelect={handleLocationSelect}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Overview" value={formData.overview} onChange={(e) => setFormData((p) => ({ ...p, overview: e.target.value }))} rows={4} />
            <div className="mt-3">
              <label className="text-sm">Max participants</label>
              <Input type="number" min={1} value={formData.maxParticipants || ""} onChange={(e) => setFormData((p) => ({ ...p, maxParticipants: e.target.value ? parseInt(e.target.value) : undefined }))} />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input id="isPublic" type="checkbox" checked={formData.isPublic} onChange={(e) => setFormData((p) => ({ ...p, isPublic: e.target.checked }))} />
              <label htmlFor="isPublic" className="text-sm">Public</label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href={`/events/${id}`} className="px-4 py-2 border rounded">Cancel</Link>
          <Button onClick={handleSave} disabled={isSaving} className="bg-[#5D5FEF] text-white">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
