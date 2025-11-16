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
  disableAutoNavigation?: boolean;
}

export default function SearchBox({
  initialCity = "",
  onSelect,
  disableAutoNavigation = false,
}: SearchBoxProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialCity);
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    setValue(initialCity || "");
  }, [initialCity]);

  // Detect if input is likely a city (letters/spaces only)
  const isCity = (input: string) => /^[a-zA-Z\s]+$/.test(input.trim());

  const fetchSuggest = async (query: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const res = await fetch(
      `/api/place-suggest?q=${encodeURIComponent(query)}`,
      {
        signal: abortRef.current.signal,
      }
    );

    if (!res.ok) return { suggestions: [] };
    return res.json();
  };

  const onChange = (v: string) => {
    setValue(v);
    setActive(-1);

    const trimmed = v.trim();

    if (!trimmed) {
      setItems([]);
      setOpen(false);
      return;
    }

    // City typing → get suggestions
    if (isCity(trimmed)) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const { suggestions } = await fetchSuggest(trimmed);
          setItems(suggestions || []);
          setOpen(true);
        } catch {
          setItems([]);
        }
      }, 220);
    } else {
      // Not a city → keyword search
      setItems([]);
      setOpen(false);
    }
  };

  const selectCity = (item: SuggestItem) => {
    setValue(item.city || item.label);
    setOpen(false);

    onSelect?.(item);

    if (!disableAutoNavigation) {
      router.push(
        `/search?lat=${item.lat}&lng=${item.lon}&city=${encodeURIComponent(
          item.city || item.label
        )}`
      );
    }
  };

  const handleDirectSearch = () => {
    if (!value.trim()) return;

    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (open && items.length > 0 && active >= 0) {
        selectCity(items[active]);
        return;
      }

      handleDirectSearch();
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

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search event, city, host..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-40 bg-transparent text-black placeholder-zinc-500 focus:outline-none"
      />

      {open && items.length > 0 && (
        <div className="absolute left-0 top-full mt-2 z-50 w-[min(22rem,90vw)] rounded-xl border bg-white shadow">
          {items.map((it, i) => (
            <button
              key={it.id}
              onMouseDown={(e) => {
                e.preventDefault();
                selectCity(it);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 ${
                i === active ? "bg-zinc-100" : ""
              }`}
            >
              <div className="font-medium">{it.city}</div>
              <div className="text-zinc-500 truncate text-xs">{it.label}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
