// IndexedDB wrapper for Health Rehab App
// Provides type-safe database operations with migration support

import type { User } from "@/types/user";
import type { PainLog } from "@/types/pain";
import { SCHEMA_VERSION } from "./constants";

const DB_NAME = "health-rehab-db";
const DB_VERSION = 1;

// Store names
export const STORES = {
  USERS: "users",
  PAIN_LOGS: "painLogs",
  EXERCISE_SESSIONS: "exerciseSessions",
  DIET_ENTRIES: "dietEntries",
  MEDICATIONS: "medications",
  MEDICATION_LOGS: "medicationLogs",
  SETTINGS: "settings",
} as const;

// Database interface
interface HealthRehabDB extends IDBDatabase {
  transaction(
    storeNames: string | string[],
    mode?: IDBTransactionMode
  ): IDBTransaction;
}

// Initialize database with schema
export async function initDB(): Promise<IDBDatabase | null> {
  // Check if we're in a browser environment
  if (typeof window === "undefined" || typeof indexedDB === "undefined") {
    // Return null silently during SSR instead of rejecting
    return null;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Users store
      if (!db.objectStoreNames.contains(STORES.USERS)) {
        const userStore = db.createObjectStore(STORES.USERS, { keyPath: "id" });
        userStore.createIndex("email", "email", { unique: true });
        userStore.createIndex("createdAt", "createdAt");
      }

      // Pain logs store
      if (!db.objectStoreNames.contains(STORES.PAIN_LOGS)) {
        const painStore = db.createObjectStore(STORES.PAIN_LOGS, {
          keyPath: "id",
        });
        painStore.createIndex("userId", "userId");
        painStore.createIndex("timestamp", "timestamp");
        painStore.createIndex("userId_timestamp", ["userId", "timestamp"]);
      }

      // Exercise sessions store
      if (!db.objectStoreNames.contains(STORES.EXERCISE_SESSIONS)) {
        const sessionStore = db.createObjectStore(STORES.EXERCISE_SESSIONS, {
          keyPath: "id",
        });
        sessionStore.createIndex("userId", "userId");
        sessionStore.createIndex("exerciseId", "exerciseId");
        sessionStore.createIndex("startTime", "startTime");
        sessionStore.createIndex("userId_startTime", ["userId", "startTime"]);
      }

      // Diet entries store
      if (!db.objectStoreNames.contains(STORES.DIET_ENTRIES)) {
        const dietStore = db.createObjectStore(STORES.DIET_ENTRIES, {
          keyPath: "id",
        });
        dietStore.createIndex("userId", "userId");
        dietStore.createIndex("date", "date");
        dietStore.createIndex("userId_date", ["userId", "date"]);
      }

      // Medications store
      if (!db.objectStoreNames.contains(STORES.MEDICATIONS)) {
        const medStore = db.createObjectStore(STORES.MEDICATIONS, {
          keyPath: "id",
        });
        medStore.createIndex("userId", "userId");
        medStore.createIndex("active", "active");
      }

      // Medication logs store
      if (!db.objectStoreNames.contains(STORES.MEDICATION_LOGS)) {
        const medLogStore = db.createObjectStore(STORES.MEDICATION_LOGS, {
          keyPath: "id",
        });
        medLogStore.createIndex("userId", "userId");
        medLogStore.createIndex("medicationId", "medicationId");
        medLogStore.createIndex("scheduledTime", "scheduledTime");
        medLogStore.createIndex("userId_scheduledTime", [
          "userId",
          "scheduledTime",
        ]);
      }

      // Settings store (key-value pairs)
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: "key" });
      }
    };
  });
}

// Generic CRUD operations
export class DBStore<T extends { id: string }> {
  constructor(private storeName: string, private db: IDBDatabase) {}

  async add(item: T): Promise<string> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.add(item);

      request.onsuccess = () => resolve(request.result as string);
      request.onerror = () => reject(request.error);
    });
  }

  async put(item: T): Promise<string> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(request.result as string);
      request.onerror = () => reject(request.error);
    });
  }

  async get(id: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllByIndex(
    indexName: string,
    value: IDBValidKey | IDBKeyRange
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async count(): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Database manager singleton
class DatabaseManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase | null> | null = null;

  async getDB(): Promise<IDBDatabase | null> {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof indexedDB === "undefined") {
      // Return null silently during SSR
      return null;
    }

    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = initDB();
    this.db = await this.initPromise;
    return this.db;
  }

  async getStore<T extends { id: string }>(
    storeName: string
  ): Promise<DBStore<T> | null> {
    const db = await this.getDB();
    if (!db) return null; // Return null during SSR
    return new DBStore<T>(storeName, db);
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

export const dbManager = new DatabaseManager();

// Migration helpers
export async function migrateFromLocalStorage() {
  try {
    // Skip during SSR
    if (typeof window === "undefined") return;

    // Migrate user data
    const userDataStr = localStorage.getItem("user-storage");
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      if (userData.state?.user) {
        const userStore = await dbManager.getStore<User>(STORES.USERS);
        if (userStore) await userStore.put(userData.state.user);
      }
    }

    // Migrate pain logs
    const painDataStr = localStorage.getItem("pain-storage");
    if (painDataStr) {
      const painData = JSON.parse(painDataStr);
      if (painData.state?.logs) {
        const painStore = await dbManager.getStore<PainLog>(STORES.PAIN_LOGS);
        if (painStore) {
          for (const log of painData.state.logs) {
            await painStore.put(log);
          }
        }
      }
    }

    // Mark migration as complete
    const db = await dbManager.getDB();
    if (!db) return;
    const transaction = db.transaction(STORES.SETTINGS, "readwrite");
    const store = transaction.objectStore(STORES.SETTINGS);
    store.put({
      key: "migrated_from_localstorage",
      value: true,
      date: new Date(),
    });

    console.log("✅ Migration from localStorage complete");
    return true;
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return false;
  }
}

// Check if migration is needed
export async function needsMigration(): Promise<boolean> {
  try {
    const db = await dbManager.getDB();
    if (!db) return false; // Skip during SSR

    return new Promise((resolve) => {
      const transaction = db.transaction(STORES.SETTINGS, "readonly");
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.get("migrated_from_localstorage");

      request.onsuccess = () => {
        resolve(!request.result);
      };
      request.onerror = () => resolve(true);
    });
  } catch {
    return true;
  }
}

// Export all data as JSON with schema version
export async function exportAllData(): Promise<string> {
  const db = await dbManager.getDB();
  if (!db) {
    return JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      dbVersion: DB_VERSION,
      exportDate: new Date().toISOString(),
      data: {},
    });
  }

  const data: Record<string, any> = {};

  for (const storeName of Object.values(STORES)) {
    const store = new DBStore(storeName, db);
    data[storeName] = await store.getAll();
  }

  return JSON.stringify(
    {
      schemaVersion: SCHEMA_VERSION,
      dbVersion: DB_VERSION,
      exportDate: new Date().toISOString(),
      data,
    },
    null,
    2
  );
}

/**
 * Import data from JSON with version validation
 *
 * Migration Path Documentation:
 * - v1.0.0: Initial schema version
 * - Future versions: Add migration logic here
 *
 * @param jsonData - JSON string containing exported data
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function importData(
  jsonData: string
): Promise<{ success: boolean; message: string }> {
  try {
    const imported = JSON.parse(jsonData);

    // Validate schema version
    if (!imported.schemaVersion) {
      return {
        success: false,
        message:
          "Import failed: No schema version found in data. This may be from an old export format.",
      };
    }

    if (imported.schemaVersion !== SCHEMA_VERSION) {
      return {
        success: false,
        message: `Schema version mismatch: Export is v${imported.schemaVersion}, but current app version is v${SCHEMA_VERSION}. Please update the app or use compatible data.`,
      };
    }

    const db = await dbManager.getDB();
    if (!db) {
      throw new Error("Database not available");
    }

    // Import data into stores
    for (const [storeName, items] of Object.entries(imported.data)) {
      if (Object.values(STORES).includes(storeName as any)) {
        const store = new DBStore(storeName, db);
        await store.clear();
        for (const item of items as any[]) {
          await store.put(item);
        }
      }
    }

    console.log("✅ Data import complete");
    return {
      success: true,
      message: `Successfully imported data from ${new Date(
        imported.exportDate
      ).toLocaleDateString()}`,
    };
  } catch (error) {
    console.error("❌ Import failed:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Import failed due to an unknown error",
    };
  }
}

// Clear all data (for testing/reset)
export async function clearAllData(): Promise<void> {
  const db = await dbManager.getDB();
  if (!db) return;

  for (const storeName of Object.values(STORES)) {
    const store = new DBStore(storeName, db);
    await store.clear();
  }

  console.log("✅ All data cleared");
}
