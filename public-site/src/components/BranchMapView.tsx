import { useEffect, useRef } from "react";

interface BranchMapViewProps {
  lat: number | null;
  lng: number | null;
  name: string;
}

const YANDEX_API_KEY = (import.meta.env.VITE_YANDEX_MAPS_KEY as string | undefined) ?? "";
const DEFAULT_LAT = 41.2995;
const DEFAULT_LNG = 69.2401;
const DEFAULT_ZOOM = 14;

declare global {
  interface Window {
    ymaps: any;
    _ymapsReady?: boolean;
    _ymapsQueue?: Array<() => void>;
  }
}

function loadYmaps(): Promise<void> {
  if (window._ymapsReady) return Promise.resolve();
  return new Promise((resolve) => {
    if (window._ymapsQueue) { window._ymapsQueue.push(resolve); return; }
    window._ymapsQueue = [resolve];
    const keyParam = YANDEX_API_KEY ? `&apikey=${YANDEX_API_KEY}` : "";
    const s = document.createElement("script");
    s.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${keyParam}`;
    s.onload = () => {
      window.ymaps.ready(() => {
        window._ymapsReady = true;
        window._ymapsQueue!.forEach((cb) => cb());
        window._ymapsQueue = undefined;
      });
    };
    document.head.appendChild(s);
  });
}

export default function BranchMapView({ lat, lng, name }: BranchMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const placemarkRef = useRef<any>(null);

  // Init map once
  useEffect(() => {
    let cancelled = false;
    loadYmaps().then(() => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const ymaps = window.ymaps;
      const cLat = lat ?? DEFAULT_LAT;
      const cLng = lng ?? DEFAULT_LNG;

      const map = new ymaps.Map(containerRef.current, {
        center: [cLat, cLng],
        zoom: DEFAULT_ZOOM,
        controls: ["zoomControl"],
      });
      mapRef.current = map;

      if (lat && lng) {
        const pm = new ymaps.Placemark([lat, lng], { balloonContent: name }, { preset: "islands#redDotIcon" });
        map.geoObjects.add(pm);
        placemarkRef.current = pm;
      }
    });
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.destroy(); mapRef.current = null; placemarkRef.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker when branch changes
  useEffect(() => {
    if (!mapRef.current || !window.ymaps) return;
    const ymaps = window.ymaps;
    const cLat = lat ?? DEFAULT_LAT;
    const cLng = lng ?? DEFAULT_LNG;

    mapRef.current.setCenter([cLat, cLng], DEFAULT_ZOOM, { duration: 300 });

    if (placemarkRef.current) {
      mapRef.current.geoObjects.remove(placemarkRef.current);
      placemarkRef.current = null;
    }
    if (lat && lng) {
      const pm = new ymaps.Placemark([lat, lng], { balloonContent: name }, { preset: "islands#redDotIcon" });
      mapRef.current.geoObjects.add(pm);
      placemarkRef.current = pm;
    }
  }, [lat, lng, name]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
  );
}
