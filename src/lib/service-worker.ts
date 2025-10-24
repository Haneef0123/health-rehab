/**
 * Service Worker Registration
 * Handles registration and lifecycle of the service worker for offline support
 */

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    console.log("Service workers are not supported");
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("Service Worker registered:", registration.scope);

      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New service worker available, prompt user to reload
            if (confirm("A new version is available! Reload to update?")) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
              window.location.reload();
            }
          }
        });
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service Worker controller changed");
      });

      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  });
}

export function unregisterServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}

export function clearServiceWorkerCache() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.controller?.postMessage({ type: "CLEAR_CACHE" });
}

export function isOnline() {
  return typeof window !== "undefined" && navigator.onLine;
}

export function setupOnlineListener(callback: (online: boolean) => void) {
  if (typeof window === "undefined") return;

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
