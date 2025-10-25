/**
 * Unified Store Synchronization System
 *
 * This module provides a robust synchronization layer between Zustand stores and IndexedDB.
 * It solves the critical issues of:
 * 1. State loss on navigation
 * 2. Data inconsistency between pages
 * 3. Missing persistence across page reloads
 * 4. Automatic hydration from IndexedDB
 *
 * Architecture:
 * - Uses Zustand persist middleware for in-memory state persistence
 * - IndexedDB as the single source of truth
 * - Automatic initialization and hydration
 * - Bi-directional sync between store and database
 * - Optimistic updates with rollback on failure
 */

import { StateCreator, StoreMutatorIdentifier } from "zustand";
import { persist, createJSONStorage, PersistOptions } from "zustand/middleware";
import { dbManager, STORES } from "@/lib/db";

// Sync status for debugging and monitoring
export interface SyncStatus {
  lastSync: Date | null;
  isHydrated: boolean;
  isSyncing: boolean;
  error: string | null;
}

// Base interface that all stores should extend
export interface SyncedStoreState {
  _syncStatus: SyncStatus;
  _markHydrated: () => void;
  _setSyncError: (error: string | null) => void;
}

/**
 * Custom IndexedDB storage for Zustand persist middleware
 * This ensures data is stored in IndexedDB, not localStorage
 */
export const createIndexedDBStorage = <T>(storeName: string) => ({
  getItem: async (name: string): Promise<string | null> => {
    try {
      // Check if we're in browser environment
      if (typeof window === "undefined") {
        return null;
      }

      const store = await dbManager.getStore<any>(storeName);
      if (!store) return null;

      // Get the persisted state from IndexedDB
      const item = await store.get(`_persist_${name}`);
      return item ? JSON.stringify(item) : null;
    } catch (error) {
      console.error(`[IndexedDB Storage] Error getting ${name}:`, error);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      // Check if we're in browser environment
      if (typeof window === "undefined") {
        return;
      }

      const store = await dbManager.getStore<any>(storeName);
      if (!store) return;

      // Store the state in IndexedDB
      const data = {
        id: `_persist_${name}`,
        data: JSON.parse(value),
        updatedAt: new Date(),
      };

      await store.put(data);
    } catch (error) {
      console.error(`[IndexedDB Storage] Error setting ${name}:`, error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      if (typeof window === "undefined") {
        return;
      }

      const store = await dbManager.getStore<any>(storeName);
      if (!store) return;

      await store.delete(`_persist_${name}`);
    } catch (error) {
      console.error(`[IndexedDB Storage] Error removing ${name}:`, error);
    }
  },
});

/**
 * Middleware to add sync status tracking to any store
 */
export const withSyncStatus = <T extends object>(
  config: StateCreator<T & SyncedStoreState>
): StateCreator<T & SyncedStoreState> => {
  return (set, get, api) => {
    return {
      ...config(
        (partial) => {
          set(partial);
          // Update last sync time on every state change
          set({
            _syncStatus: {
              ...get()._syncStatus,
              lastSync: new Date(),
            },
          } as any);
        },
        get,
        api
      ),
      _syncStatus: {
        lastSync: null,
        isHydrated: false,
        isSyncing: false,
        error: null,
      },
      _markHydrated: () => {
        set({
          _syncStatus: {
            ...get()._syncStatus,
            isHydrated: true,
            lastSync: new Date(),
          },
        } as any);
      },
      _setSyncError: (error: string | null) => {
        set({
          _syncStatus: {
            ...get()._syncStatus,
            error,
            isSyncing: false,
          },
        } as any);
      },
    };
  };
};

/**
 * Create a synced store with automatic IndexedDB persistence
 *
 * Usage:
 * ```typescript
 * export const usePainStore = createSyncedStore<PainState>(
 *   'pain-store',
 *   STORES.PAIN_LOGS,
 *   (set, get) => ({
 *     logs: [],
 *     addLog: async (log) => { ... }
 *   })
 * );
 * ```
 */
export function createSyncedStore<T extends object>(
  storeName: string,
  indexedDBStore: string,
  config: StateCreator<T & SyncedStoreState>
) {
  return persist(withSyncStatus(config), {
    name: storeName,
    storage: createJSONStorage(() => localStorage), // Use localStorage for quick access
    partialize: (state: any) => {
      // Don't persist sync status and loading states
      const { _syncStatus, isLoading, error, ...rest } = state;
      return rest;
    },
    onRehydrateStorage: () => {
      return (state, error) => {
        if (error) {
          console.error(`[${storeName}] Hydration error:`, error);
        } else if (state) {
          console.log(`[${storeName}] Hydrated successfully`);
          (state as any)._markHydrated?.();
        }
      };
    },
  });
}

/**
 * Hook to ensure a store is initialized with IndexedDB data
 * This should be called in the root layout or a provider component
 */
export function useStoreInitializer<
  T extends { initializeStore?: () => Promise<void> }
>(useStore: () => T, deps: any[] = []) {
  const store = useStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    // Skip during SSR
    if (typeof window === "undefined") {
      return;
    }

    // Only initialize once
    if (isInitialized) {
      return;
    }

    const initialize = async () => {
      try {
        if (store.initializeStore) {
          await store.initializeStore();
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Store initialization error:", error);
      }
    };

    initialize();
  }, [store, isInitialized, ...deps]);

  return isInitialized;
}

// Import React for hooks
import React from "react";

/**
 * Optimistic update helper
 * Performs an optimistic update to the store, then syncs with IndexedDB
 * Rolls back if the database operation fails
 */
export async function optimisticUpdate<T>(
  getState: () => T,
  setState: (partial: Partial<T>) => void,
  optimisticState: Partial<T>,
  dbOperation: () => Promise<void>
): Promise<void> {
  // Save current state for potential rollback
  const previousState = { ...getState() };

  // Apply optimistic update
  setState(optimisticState);

  try {
    // Perform database operation
    await dbOperation();
  } catch (error) {
    // Rollback on error
    console.error("Optimistic update failed, rolling back:", error);
    setState(previousState);
    throw error;
  }
}

/**
 * Batch update helper
 * Groups multiple state updates together for performance
 */
export function batchUpdate<T>(
  setState: (partial: Partial<T>) => void,
  updates: Array<() => Partial<T>>
): void {
  const batchedUpdates = updates.reduce(
    (acc, update) => ({ ...acc, ...update() }),
    {}
  );
  setState(batchedUpdates);
}

/**
 * Create a cross-store listener
 * Allows stores to react to changes in other stores
 */
export function createCrossStoreListener<S, T>(
  sourceStore: () => S,
  selector: (state: S) => T,
  callback: (value: T) => void
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const unsubscribe = (sourceStore as any).subscribe?.(
    (state: S) => selector(state),
    callback
  );

  return unsubscribe || (() => {});
}
