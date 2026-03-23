import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if user dismissed before
    const wasDismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) setDismissed(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-install-dismissed", "1");
  };

  if (isInstalled || dismissed || !deferredPrompt) return null;

  return (
    <div
      data-ocid="pwa.install.panel"
      className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm"
    >
      <div className="bg-white border border-emerald-200 shadow-xl rounded-2xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">
            Install Lost It Find It
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            Add to your home screen for quick access
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              data-ocid="pwa.install.primary_button"
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8"
              onClick={handleInstall}
            >
              Install
            </Button>
            <Button
              data-ocid="pwa.install.cancel_button"
              size="sm"
              variant="ghost"
              className="text-gray-500 text-xs h-8"
              onClick={handleDismiss}
            >
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          data-ocid="pwa.install.close_button"
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
