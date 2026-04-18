import { useState, useRef, useEffect } from "react";
import { Loader2, MapPin } from "lucide-react";

interface Suggestion {
  title: string;
  subtitle: string;
  value: string;
  lat: string;
  lng: string;
}

interface AddressSuggestProps {
  value: string;
  onChange: (address: string) => void;
  /** Called when user picks a suggestion — address + lat/lng ready immediately */
  onSelect: (address: string, lat: string, lng: string) => void;
  placeholder?: string;
  className?: string;
}

async function fetchSuggestions(q: string): Promise<Suggestion[]> {
  try {
    const res = await fetch(`/api/geo/suggest?q=${encodeURIComponent(q)}`);
    if (!res.ok) return [];
    const data = await res.json() as { results: Suggestion[] };
    return data.results ?? [];
  } catch {
    return [];
  }
}

// Matches shadcn <Input> styling
const inputBase =
  "h-9 w-full rounded-md border px-3 py-1 text-base shadow-xs outline-none " +
  "transition-[color,box-shadow] placeholder:text-muted-foreground md:text-sm " +
  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export default function AddressSuggest({
  value,
  onChange,
  onSelect,
  placeholder,
  className,
}: AddressSuggestProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = (query: string) => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (query.trim().length < 3) { setSuggestions([]); setOpen(false); return; }
    suggestTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchSuggestions(query);
        setSuggestions(results);
        setOpen(results.length > 0);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSelect = (s: Suggestion) => {
    setOpen(false);
    setSuggestions([]);
    // Coordinates already embedded in Nominatim response — no extra geocode call needed
    onSelect(s.value, s.lat, s.lng);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); search(e.target.value); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`${inputBase} ${className ?? ""}`}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-[300] left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border/40 last:border-0 cursor-pointer"
            >
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#13D6D1]" />
              <div>
                <p className="text-sm text-foreground leading-snug">{s.title}</p>
                {s.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{s.subtitle}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
