import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SuggestItem = {
  id: string;
  label: string;
  city: string;
  lat: string;
  lon: string;
};

interface SearchBoxProps {
  initialCity?: string;
  onSelect?: (selected: SuggestItem) => void;
  disableAutoNavigation?: boolean; // When true, don't auto-navigate on selection
}

export default function SearchBox({
  initialCity = "",
  onSelect,
  disableAutoNavigation = false,
}: SearchBoxProps) {
  const router = useRouter();
  const [city, setCity] = useState(initialCity);
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // keep city in sync when Navbar updates it after geolocation
  useEffect(() => {
    setCity(initialCity || "");
  }, [initialCity]);

  const fetchSuggest = async (query: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const res = await fetch(
      `/api/place-suggest?q=${encodeURIComponent(query)}`,
      {
        signal: abortRef.current.signal,
      }
    );
    if (!res.ok) return { suggestions: [] as SuggestItem[] };
    return res.json() as Promise<{ suggestions: SuggestItem[] }>;
  };

  const onChange = (v: string) => {
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (disableAutoNavigation) {
        // Don't handle Enter, let parent form handle it
        if (open && items.length > 0 && active >= 0) {
          // Just select the item without navigating
          const item = items[active];
          setCity(item.city || item.label);
          setOpen(false);
          onSelect?.(item);
          e.preventDefault();
        }
        // Otherwise, let the form submit naturally
        return;
      }

      // Normal behavior when not in a form
      e.preventDefault();
      if (open && items.length > 0 && active >= 0) {
        // Select from dropdown
        selectItem(items[active]);
      } else {
        // Direct search
        handleDirectSearch();
      }
      return;
    }

    if (!open || !items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectItem = (item: SuggestItem) => {
    setCity(item.city || item.label);
    setOpen(false);
    onSelect?.(item);

    // Only navigate if auto-navigation is enabled
    if (!disableAutoNavigation) {
      // Go to Search Results page with the chosen coordinates
      const lat = Number(item.lat);
      const lng = Number(item.lon);
      const params = new URLSearchParams();
      params.append("lat", lat.toString());
      params.append("lng", lng.toString());
      params.append("city", item.city || item.label);

      router.push(`/search?${params.toString()}`);
    }
  };

  // Handle pressing Enter without selecting from dropdown (direct search)
  const handleDirectSearch = () => {
    if (!city.trim()) return;

    const params = new URLSearchParams();
    params.append("q", city.trim());

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="City"
        value={city}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-40 bg-transparent text-black placeholder-zinc-500 focus:outline-none"
      />
      {open && items.length > 0 && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(22rem,90vw)] rounded-xl border border-zinc-200 bg-white shadow-lg overflow-hidden">
          {items.map((it, i) => (
            <button
              key={it.id}
              onMouseDown={(e) => {
                e.preventDefault();
                selectItem(it);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 ${
                i === active ? "bg-zinc-100" : ""
              }`}
            >
              {it.city && <span className="font-medium">{it.city}</span>}
              <span className="block text-zinc-500 truncate">{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
