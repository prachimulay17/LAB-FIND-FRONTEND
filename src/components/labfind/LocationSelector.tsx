import { useState } from "react";
import { MapPin, LocateFixed, Loader2 } from "lucide-react";

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCurrent = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location is unavailable on this device.");
      return;
    }
    setError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Reverse geocoding will replace this once the maps API is connected.
        onChange(`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
        setLocating(false);
      },
      () => {
        setError("Couldn't get your location. Enter it manually.");
        setLocating(false);
      },
      { timeout: 8000 },
    );
  };

  return (
    <div>
      <label htmlFor="location" className="label-caps">
        Near
      </label>
      <div className="mt-2 flex items-center gap-1 rounded-md border border-border bg-surface px-3 focus-within:border-primary">
        <MapPin className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <input
          id="location"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Area, city or pincode"
          className="w-full bg-transparent py-2.5 text-[14px] outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={useCurrent}
          aria-label="Use current location"
          className="shrink-0 rounded-sm p-1 text-primary transition-colors hover:bg-primary-soft"
        >
          {locating ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
          ) : (
            <LocateFixed className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </div>
      {error && <p className="mt-1.5 text-[12px] text-destructive">{error}</p>}
    </div>
  );
}
