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
}

export default function SearchBox({
  initialCity = "",
  onSelect,
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
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && active >= 0) {
      selectItem(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const selectItem = (item: SuggestItem) => {
    setCity(item.city || item.label);
    setOpen(false);
    onSelect?.(item);

    // Go to Search Results page with the chosen coordinates
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    const params = new URLSearchParams();
    params.append("lat", lat.toString());
    params.append("lng", lng.toString());
    params.append("city", item.city || item.label);
    
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
