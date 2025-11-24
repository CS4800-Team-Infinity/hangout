import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

type SuggestItem = {
  id: string;
  label: string;
  city: string;
  lat: string;
  lon: string;
};

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (selected: SuggestItem) => void;
  placeholder?: string;
}

export default function LocationInput({
  value,
  onChange,
  onSelect,
  placeholder = "Enter a location",
}: LocationInputProps) {
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleChange = (v: string) => {
    onChange(v);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (open && items.length > 0 && active >= 0) {
        selectItem(items[active]);
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
    onChange(item.label);
    setOpen(false);
    onSelect(item);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pr-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          📍
        </span>
      </div>
      {open && items.length > 0 && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectItem(it);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                i === active ? "bg-gray-100" : ""
              }`}
            >
              {it.city && <span className="font-medium block">{it.city}</span>}
              <span className="text-gray-500 text-xs truncate">{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
