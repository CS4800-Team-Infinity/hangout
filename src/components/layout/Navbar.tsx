'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

type SuggestItem = { id: string; label: string; city: string; lat: string; lon: string };

export function Navbar() {
    const { user, isAuthenticated, logout, isLoading } = useAuth();

    // hydration-safe flags
    const [mounted, setMounted] = useState(false);

    // left search input: event query
    const [q, setQ] = useState('');

    // right side: city display -> editable input on click
    const [city, setCity] = useState<string>('');          // filled after mount
    const [editingCity, setEditingCity] = useState(false); // toggles display/input
    const [items, setItems] = useState<SuggestItem[]>([]);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);

    const abortRef = useRef<AbortController | null>(null);
    const debounceRef = useRef<any>(null);
    const cityInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setMounted(true);

        // prefer user profile city
        if ((user as any)?.city) {
            setCity((user as any).city);
            return;
        }

        // fallback to geolocation -> reverse geocode
        if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async ({ coords }) => {
                    try {
                        const r = await fetch(`/api/reverse-geocode?lat=${coords.latitude}&lng=${coords.longitude}`);
                        const data = r.ok ? await r.json() : null;
                        setCity(data?.city || 'Your city');
                    } catch {
                        setCity('Your city');
                    }
                },
                () => setCity('Your city'),
                { timeout: 5000 }
            );
        } else {
            setCity('Your city');
        }
    }, [user]);

    // suggestions
    const fetchSuggest = async (query: string) => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        const res = await fetch(`/api/place-suggest?q=${encodeURIComponent(query)}`, {
            signal: abortRef.current.signal,
        });
        if (!res.ok) return { suggestions: [] as SuggestItem[] };
        return res.json() as Promise<{ suggestions: SuggestItem[] }>;
    };

    const onCityChange = (v: string) => {
        setCity(v);
        setOpen(Boolean(v.trim()));
        setActive(-1);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            if (!v.trim()) {
                setItems([]);
                return;
            }
            try {
                const { suggestions } = await fetchSuggest(v.trim());
                setItems(suggestions || []);
            } catch {
                setItems([]);
            }
        }, 220);
    };

    const onCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || !items.length) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(i => Math.min(i + 1, items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            if (active >= 0) {
                const sel = items[active];
                setCity(sel.city || sel.label);
                setOpen(false);
                setEditingCity(false);
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
            setEditingCity(false);
        }
    };

    useEffect(() => {
        if (editingCity) cityInputRef.current?.focus();
    }, [editingCity]);

    const handleLogout = () => logout();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ q, city: city || 'Your city' });
    };

    return (
        <nav className="w-full fixed top-0 left-0 right-0 bg-white backdrop-blur shadow-md z-50">
            <div className="px-4 md:px-10">
                {/* brand + search (desktop only) + auth */}
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* brand */}
                        <Link href="/" className="flex items-center gap-2 select-none">
                            <Image src="/infinity-logo.png" alt="HangOut" width={32} height={32} priority className="rounded-full" />
                            <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] bg-clip-text text-transparent">
                                HangOut
                            </span>
                        </Link>

                        {/* DESKTOP search (inline) */}
                        <form onSubmit={handleSearch} className="hidden md:block w-[600px] max-w-xl mx-6">
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

                                    {!editingCity ? (
                                        <button
                                            type="button"
                                            onClick={() => setEditingCity(true)}
                                            className="min-w-[6rem] truncate text-left text-sm text-zinc-700 hover:text-zinc-900"
                                        >
                                            <span suppressHydrationWarning>{mounted ? (city || 'Your city') : ''}</span>
                                        </button>
                                    ) : (
                                        <>
                                            <input
                                                ref={cityInputRef}
                                                type="text"
                                                placeholder="City"
                                                value={city}
                                                onChange={(e) => onCityChange(e.target.value)}
                                                onKeyDown={onCityKeyDown}
                                                className="w-40 bg-transparent text-black placeholder-zinc-500 focus:outline-none"
                                                onBlur={() => setTimeout(() => { setEditingCity(false); setOpen(false); }, 120)}
                                            />
                                            {open && items.length > 0 && (
                                                <div
                                                    role="listbox"
                                                    className="absolute right-2 top-[calc(100%+8px)] z-50 w-[min(22rem,90vw)] rounded-xl border border-zinc-200 bg-white shadow-lg overflow-hidden"
                                                >
                                                    {items.map((it, i) => (
                                                        <button
                                                            key={it.id}
                                                            role="option"
                                                            aria-selected={i === active}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                setCity(it.city || it.label);
                                                                setOpen(false);
                                                                setEditingCity(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 ${i === active ? 'bg-zinc-100' : ''}`}
                                                        >
                                                            {it.city ? <span className="font-medium">{it.city}</span> : null}
                                                            <span className="block text-zinc-500 truncate">{it.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* auth */}
                    <div className="flex items-center gap-4">
                        {!mounted || isLoading ? (
                            <div className="text-sm text-zinc-400">login...</div>
                        ) : isAuthenticated && user ? (
                            <>
                                <div className="hidden sm:block text-sm text-zinc-400">welcome, {user.name}!</div>
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    size="sm"
                                    className="text-md text-black border border-zinc-300 transition-all  hover:text-white hover:bg-gradient-to-r  hover:from-[#EF5DA8] hover:to-[#5D5FEF]"
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
                                    className="inline-flex items-center rounded-full bg-gradient-to-r from-[#5D5FEF] to-[#EF5DA8] px-4 py-2 text-md font-semibold text-white shadow transition-all hover:bg-gradient-to-r hover:from-[#EF5DA8] hover:to-[#5D5FEF]"
                                >
                                    sign up
                                </Link>

                            </>
                        )}
                    </div>
                </div>

                {/* mobile search*/}
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

                                {!editingCity ? (
                                    <button
                                        type="button"
                                        onClick={() => setEditingCity(true)}
                                        className="min-w-[5rem] truncate text-left text-sm text-zinc-700"
                                    >
                                        <span suppressHydrationWarning>{mounted ? (city || 'Your city') : ''}</span>
                                    </button>
                                ) : (
                                    <>
                                        <input
                                            ref={cityInputRef}
                                            type="text"
                                            placeholder="City"
                                            value={city}
                                            onChange={(e) => onCityChange(e.target.value)}
                                            onKeyDown={onCityKeyDown}
                                            className="w-32 bg-transparent text-black placeholder-zinc-500 focus:outline-none"
                                            onBlur={() => setTimeout(() => { setEditingCity(false); setOpen(false); }, 120)}
                                        />
                                        {open && items.length > 0 && (
                                            <div
                                                role="listbox"
                                                className="absolute right-2 top-[calc(100%+8px)] z-50 w-[min(22rem,90vw)] rounded-xl border border-zinc-200 bg-white shadow-lg overflow-hidden"
                                            >
                                                {items.map((it, i) => (
                                                    <button
                                                        key={it.id}
                                                        role="option"
                                                        aria-selected={i === active}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            setCity(it.city || it.label);
                                                            setOpen(false);
                                                            setEditingCity(false);
                                                        }}
                                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 ${i === active ? 'bg-zinc-100' : ''}`}
                                                    >
                                                        {it.city ? <span className="font-medium">{it.city}</span> : null}
                                                        <span className="block text-zinc-500 truncate">{it.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </nav>
    );

}
