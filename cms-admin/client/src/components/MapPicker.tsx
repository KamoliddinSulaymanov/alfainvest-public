import { useEffect, useRef, useCallback } from "react";
import { loadYmaps } from "@/lib/ymaps";

interface MapPickerProps {
  lat: string;
  lng: string;
  onCoordsChange: (lat: string, lng: string, address?: string) => void;
}

const DEFAULT_LAT = 41.2995;
const DEFAULT_LNG = 69.2401;
const DEFAULT_ZOOM = 12;

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const result = await window.ymaps.geocode([lat, lng], { results: 1 });
    const obj = result.geoObjects.get(0);
    if (!obj) return null;
    return obj.getAddressLine() ?? null;
  } catch {
    return null;
  }
}

export default function MapPicker({ lat, lng, onCoordsChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const placemarkRef = useRef<any>(null);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCoordsChangeRef = useRef(onCoordsChange);
  useEffect(() => { onCoordsChangeRef.current = onCoordsChange; });

  const scheduleGeocode = useCallback((newLat: number, newLng: number) => {
    const latStr = newLat.toFixed(6);
    const lngStr = newLng.toFixed(6);
    onCoordsChangeRef.current(latStr, lngStr);
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(async () => {
      const address = await reverseGeocode(newLat, newLng);
      onCoordsChangeRef.current(latStr, lngStr, address ?? undefined);
    }, 700);
  }, []);

  const placeMark = useCallback((newLat: number, newLng: number, triggerGeocode = true) => {
    const ymaps = window.ymaps;
    if (!ymaps || !mapRef.current) return;
    if (placemarkRef.current) {
      placemarkRef.current.geometry.setCoordinates([newLat, newLng]);
    } else {
      const pm = new ymaps.Placemark([newLat, newLng], {}, { draggable: true, preset: "islands#redDotIcon" });
      pm.events.add("dragend", () => {
        const coords = pm.geometry.getCoordinates();
        scheduleGeocode(coords[0], coords[1]);
      });
      mapRef.current.geoObjects.add(pm);
      placemarkRef.current = pm;
    }
    if (triggerGeocode) scheduleGeocode(newLat, newLng);
  }, [scheduleGeocode]);

  useEffect(() => {
    let cancelled = false;
    loadYmaps().then(() => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const ymaps = window.ymaps;
      const initLat = parseFloat(lat) || DEFAULT_LAT;
      const initLng = parseFloat(lng) || DEFAULT_LNG;
      const map = new ymaps.Map(containerRef.current, {
        center: [initLat, initLng],
        zoom: DEFAULT_ZOOM,
        controls: ["zoomControl", "fullscreenControl"],
      });
      mapRef.current = map;
      if (lat && lng) placeMark(initLat, initLng, false);
      map.events.add("click", (e: any) => {
        const coords = e.get("coords") as [number, number];
        placeMark(coords[0], coords[1], true);
        map.setCenter(coords);
      });
    });
    return () => {
      cancelled = true;
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
      if (mapRef.current) { mapRef.current.destroy(); mapRef.current = null; placemarkRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!mapRef.current || isNaN(parsedLat) || isNaN(parsedLng)) return;
    const current = placemarkRef.current?.geometry.getCoordinates();
    if (current && Math.abs(current[0] - parsedLat) < 0.000001 && Math.abs(current[1] - parsedLng) < 0.000001) return;
    placeMark(parsedLat, parsedLng, false);
    mapRef.current.setCenter([parsedLat, parsedLng]);
  }, [lat, lng, placeMark]);

  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height: 260 }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
