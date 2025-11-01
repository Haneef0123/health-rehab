"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import {
  useUserStore,
  usePainStore,
  useExerciseStore,
  useDietStore,
  useMedicationStore,
} from "@/stores";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initializeUser } = useUserStore();
  const { initializeLogs } = usePainStore();
  const { initializeSessions } = useExerciseStore();
  const { initializeStore: initializeDiet } = useDietStore();
  const { initializeStore: initializeMedication } = useMedicationStore();

  useEffect(() => {
    // Initialize all store data on mount only
    const initializeStores = async () => {
      await Promise.all([
        initializeUser(),
        initializeLogs(),
        initializeSessions(),
        initializeDiet(),
        initializeMedication(),
      ]);
    };

    initializeStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - Zustand store functions are stable

  return (
    <>
      <ServiceWorkerRegistration />
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
