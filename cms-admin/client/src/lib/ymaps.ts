// Shared Yandex Maps JS API 2.1 loader
const YANDEX_API_KEY = (import.meta.env.VITE_YANDEX_MAPS_KEY as string | undefined) ?? "";

declare global {
  interface Window {
    ymaps: any;
    _ymapsReady?: boolean;
    _ymapsQueue?: Array<() => void>;
  }
}

export function loadYmaps(): Promise<void> {
  if (window._ymapsReady && window.ymaps) return Promise.resolve();

  return new Promise((resolve) => {
    if (window._ymapsQueue) {
      window._ymapsQueue.push(resolve);
      return;
    }
    window._ymapsQueue = [resolve];

    const keyParam = YANDEX_API_KEY ? `&apikey=${YANDEX_API_KEY}` : "";
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${keyParam}`;
    script.onload = () => {
      window.ymaps.ready(() => {
        window._ymapsReady = true;
        window._ymapsQueue!.forEach((cb) => cb());
        window._ymapsQueue = undefined;
      });
    };
    document.head.appendChild(script);
  });
}
