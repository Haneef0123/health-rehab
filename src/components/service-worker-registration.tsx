"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/service-worker";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker in production only
    if (process.env.NODE_ENV === "production") {
      registerServiceWorker();
    }
  }, []);

  return null;
}
