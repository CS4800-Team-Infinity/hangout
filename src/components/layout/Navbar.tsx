"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => logout();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!q.trim()) {
      return;
    }

    const params = new URLSearchParams();
    params.append("q", q.trim());

    router.push(`/search?${params.toString()}`);
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
              href="/explore"
              className="hidden md:block text-md font-semibold text-black transition-colors hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#5D5FEF] hover:to-[#EF5DA8]"
            >
              Explore
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
                    placeholder="Search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full bg-transparent text-black placeholder-zinc-500 focus:outline-none"
                  />

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="ml-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] text-white text-sm font-semibold hover:from-[#EF5DA8] hover:to-[#5D5FEF] transition-all"
                  >
                    Go
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {/* Create Event Button - Only visible when logged in */}
            {mounted && isAuthenticated && user && (
              <Link
                href="/events/create"
                className="inline-flex items-center gap-1 text-md font-semibold text-black transition-colors hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#5D5FEF] hover:to-[#EF5DA8]"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Event
              </Link>
            )}

            {!mounted || isLoading ? (
              <div className="text-sm text-zinc-400">login...</div>
            ) : isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  className="hidden sm:block text-md font-semibold text-black transition-colors hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#5D5FEF] hover:to-[#EF5DA8]"
                >
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
                  placeholder="Search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full bg-transparent text-black placeholder-zinc-500 focus:outline-none"
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
