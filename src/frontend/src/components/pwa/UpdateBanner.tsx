import { useEffect, useState } from "react";

export default function UpdateBanner() {
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const reg = (e as CustomEvent<ServiceWorkerRegistration>).detail;
      setRegistration(reg);
    };
    window.addEventListener("swUpdateAvailable", handler);
    return () => window.removeEventListener("swUpdateAvailable", handler);
  }, []);

  if (!registration) return null;

  const handleUpdate = () => {
    registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    setRegistration(null);
  };

  return (
    <div
      role="alert"
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-orange-500/40 bg-black/90 px-4 py-3 shadow-lg backdrop-blur-sm sm:bottom-6"
    >
      <span className="text-sm text-white">A new version is available</span>
      <button
        type="button"
        onClick={handleUpdate}
        className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
      >
        Update now
      </button>
      <button
        type="button"
        onClick={() => setRegistration(null)}
        aria-label="Dismiss"
        className="ml-1 text-white/50 hover:text-white text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
