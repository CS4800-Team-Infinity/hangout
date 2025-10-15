"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import SearchBox from "@/components/Map/SearchBox";

type SuggestItem = {
  id: string;
  label: string;
  city: string;
  lat: string;
  lon: string;
};

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string>("Your city");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setMounted(true);

    // Prefer user's city from profile if available
    if ((user as any)?.city) {
      setCity((user as any).city);
      return;
    }

    // Otherwise use geolocation
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const r = await fetch(
              `/api/reverse-geocode?lat=${coords.latitude}&lng=${coords.longitude}`
            );
            const data = r.ok ? await r.json() : null;
            setCity(data?.city || "Your city");
          } catch {
            setCity("Your city");
          }
        },
        () => setCity("Your city"),
        { timeout: 5000 }
      );
    }
  }, [user]);

  const handleLogout = () => logout();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 handleSearch called with q:", q, "city:", city);

    if (!q.trim() && city === "Your city") {
      console.log("⚠️ No search term or city, returning early");
      return;
    }

    const params = new URLSearchParams();

    // Determine what to search for
    const searchTerm = q.trim() || city;
    console.log("🔍 Search term:", searchTerm);

    // Always add the search query
    if (q.trim()) {
      params.append("q", q.trim());
    }

    // Try to geocode the search term to get coordinates
    if (selectedLocation) {
      // User explicitly selected a location from dropdown
      console.log("📍 Using selected location:", selectedLocation);
      params.append("lat", selectedLocation.lat.toString());
      params.append("lng", selectedLocation.lng.toString());
      params.append("city", city !== "Your city" ? city : "Selected Location");
    } else {
      // Try to geocode the search term (could be city name or location)
      try {
        console.log("🌐 Geocoding search term:", searchTerm);
        const response = await fetch(`/api/place-suggest?q=${encodeURIComponent(searchTerm)}`);
        console.log("🌐 Geocode response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("🌐 Geocode data:", data);

          if (data.suggestions && data.suggestions.length > 0) {
            const firstResult = data.suggestions[0];
            console.log("✅ Found geocode result:", firstResult);
            params.append("lat", firstResult.lat);
            params.append("lng", firstResult.lon);
            params.append("city", firstResult.city || firstResult.label);
          } else if (city !== "Your city") {
            // Fallback to current city
            console.log("⚠️ No geocode results, using current city:", city);
            params.append("city", city);
          }
        } else if (city !== "Your city") {
          console.log("⚠️ Geocode failed, using current city:", city);
          params.append("city", city);
        }
      } catch (error) {
        console.error("❌ Error geocoding:", error);
        if (city !== "Your city") {
          params.append("city", city);
        }
      }
    }

    const searchUrl = `/search?${params.toString()}`;
    console.log("🚀 Navigating to:", searchUrl);
    router.push(searchUrl);
  };

  return (
    <nav className="w-full fixed top-0 left-0 right-0 bg-white backdrop-blur shadow-md z-50">
      <div className="px-4 md:px-10">
        <div className="flex h-16 items-center justify-between">
          {/* Left section: logo + links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 select-none">
              <Image
                src="/infinity-logo.png"
                alt="HangOut"
                width={32}
                height={32}
                priority
                className="rounded-full"
              />
              <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] bg-clip-text text-transparent">
                HangOut
              </span>
            </Link>

            <Link
              href="/about"
              className="text-md font-semibold text-black transition-colors hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#5D5FEF] hover:to-[#EF5DA8]"
            >
              About
            </Link>

            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:block w-[600px] max-w-xl mx-6"
            >
              <div className="p-[2px] rounded-full bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8]">
                <div className="relative flex items-center gap-3 rounded-full bg-white/95 px-4 py-2">
                  <span aria-hidden>🔍</span>
                  <input
                    type="text"
                    placeholder="Search event..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full bg-transparent text-black placeholder-zinc-500 focus:outline-none"
                  />
                  <span className="h-6 w-px bg-gradient-to-b from-transparent via-zinc-300 to-transparent" />
                  <span aria-hidden>📍</span>

                  {/* Reusable SearchBox component */}
                  <SearchBox
                    initialCity={city}
                    disableAutoNavigation={true}
                    onSelect={(selected: SuggestItem) => {
                      setCity(selected.city || selected.label);
                      setSelectedLocation({
                        lat: parseFloat(selected.lat),
                        lng: parseFloat(selected.lon),
                      });
                    }}
                  />

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="ml-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] text-white text-sm font-semibold hover:from-[#EF5DA8] hover:to-[#5D5FEF] transition-all"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {!mounted || isLoading ? (
              <div className="text-sm text-zinc-400">login...</div>
            ) : isAuthenticated && user ? (
              <>
                <Link 
                  href="/profile"
                  className="hidden sm:block text-md font-semibold text-black transition-colors hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#5D5FEF] hover:to-[#EF5DA8]">
                  Welcome, {user.name}!
                </Link>
                <Button
                  onClick={handleLogout}
                  size="sm"
                  className="text-md font-semibold text-black bg-white border border-zinc-300 hover:text-white hover:bg-gradient-to-r hover:from-[#EF5DA8] hover:to-[#5D5FEF] transition-all hover: cursor-pointer"
                >
                  logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-md font-semibold text-black transition-colors hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#5D5FEF] hover:to-[#EF5DA8]"
                >
                  login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] px-4 py-2 text-md font-semibold text-white shadow transition-all hover:from-[#EF5DA8] hover:to-[#5D5FEF]"
                >
                  sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="block md:hidden pb-3">
          <form onSubmit={handleSearch} className="w-full max-w-lg mx-auto">
            <div className="p-[2px] rounded-full bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8]">
              <div className="relative flex items-center gap-3 rounded-full bg-white/95 px-4 py-2">
                <span aria-hidden>🔍</span>
                <input
                  type="text"
                  placeholder="Search event..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full bg-transparent text-black placeholder-zinc-500 focus:outline-none"
                />
                <span className="h-6 w-px bg-gradient-to-b from-transparent via-zinc-300 to-transparent" />
                <span aria-hidden>📍</span>

                <SearchBox
                  initialCity={city}
                  disableAutoNavigation={true}
                  onSelect={(selected: SuggestItem) => {
                    setCity(selected.city || selected.label);
                    setSelectedLocation({
                      lat: parseFloat(selected.lat),
                      lng: parseFloat(selected.lon),
                    });
                  }}
                />

                {/* Search Button */}
                <button
                  type="submit"
                  className="ml-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] text-white text-xs font-semibold hover:from-[#EF5DA8] hover:to-[#5D5FEF] transition-all"
                >
                  Go
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </nav>
  );
}
