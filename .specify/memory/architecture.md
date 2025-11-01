# Health Rehab System Architecture

**Version:** 1.0.0
**Last Updated:** 2025-11-01
**Status:** Active (Phase 1 - MVP)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Directory Structure](#directory-structure)
4. [Data Models](#data-models)
5. [State Management](#state-management)
6. [Data Persistence](#data-persistence)
7. [API Structure (Future)](#api-structure-future)
8. [Performance Optimization](#performance-optimization)
9. [Security Considerations](#security-considerations)
10. [Deployment Strategy](#deployment-strategy)
11. [Monitoring & Observability](#monitoring--observability)

---

## System Overview

The Health Rehab application is a **single-user, offline-first Progressive Web App (PWA)** built with Next.js 15, designed to help Haneef track and manage spine health rehabilitation.

### Current Architecture (Phase 1 - MVP)

```
┌─────────────────────────────────────────────────────────────┐
│                       User Browser                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │            Next.js 15 App (Client-Side)           │    │
│  │                                                   │    │
│  │  ├─ React 19 Components                          │    │
│  │  ├─ Zustand State Management                     │    │
│  │  ├─ React Hook Form + Zod Validation             │    │
│  │  └─ Tailwind CSS + Radix UI                      │    │
│  └───────────────────────────────────────────────────┘    │
│                          │                                  │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────┐    │
│  │               IndexedDB Storage                   │    │
│  │                                                   │    │
│  │  ├─ Pain Logs                                     │    │
│  │  ├─ Exercise Sessions                             │    │
│  │  ├─ Medication Logs                               │    │
│  │  ├─ Diet & Hydration                              │    │
│  │  └─ User Profile                                  │    │
│  └───────────────────────────────────────────────────┘    │
│                          │                                  │
│                          ▼                                  │
│  ┌───────────────────────────────────────────────────┐    │
│  │           Service Worker (PWA Cache)              │    │
│  │                                                   │    │
│  │  ├─ App Shell Caching                             │    │
│  │  ├─ Asset Caching (Images, Fonts)                 │    │
│  │  └─ Offline Fallback                              │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ (Deployed to)
                          ▼
              ┌───────────────────────┐
              │   Netlify CDN/Edge    │
              └───────────────────────┘
```

### Future Architecture (Phase 2 - Backend Integration)

```
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   Browser    │◄────────►│  Backend API │◄────────►│  PostgreSQL  │
│  (Next.js)   │          │   (Fastify)  │          │   Database   │
└──────────────┘          └──────────────┘          └──────────────┘
       │                          │                          │
       │                          │                          │
       ▼                          ▼                          ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│  IndexedDB   │          │    Redis     │          │   Backups    │
│   (Offline)  │          │   (Cache)    │          │  (Automated) │
└──────────────┘          └──────────────┘          └──────────────┘
```

---

## Architecture Diagram

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │   Pages    │  │ Components │  │   Layouts  │  │  Styles  │ │
│  │ (Routes)   │  │  (UI + UX) │  │  (Header,  │  │(Tailwind)│ │
│  │            │  │            │  │  Sidebar)  │  │          │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT LAYER                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │Pain Store  │  │Exercise    │  │Medication  │  │UI Store  │ │
│  │(Zustand)   │  │Store       │  │Store       │  │(Toasts)  │ │
│  │            │  │(Zustand)   │  │(Zustand)   │  │          │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
│  ┌────────────┐  ┌────────────┐                                │
│  │Diet Store  │  │User Store  │                                │
│  │(Zustand)   │  │(Zustand)   │                                │
│  └────────────┘  └────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC LAYER                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ Validation │  │ Analytics  │  │Performance │  │Constants │ │
│  │   (Zod)    │  │(Calcs &    │  │ Monitoring │  │(Enums)   │ │
│  │            │  │ Insights)  │  │            │  │          │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA PERSISTENCE LAYER                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              IndexedDB Manager (db.ts)                  │   │
│  │                                                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │   │
│  │  │PainLogs  │  │Exercises │  │Medications│ │MealLogs│ │   │
│  │  │  Table   │  │  Table   │  │  Table   │  │ Table  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │   │
│  │  ┌──────────┐  ┌──────────┐                           │   │
│  │  │UserProfile│ │Hydration │                           │   │
│  │  │  Table   │  │  Table   │                           │   │
│  │  └──────────┘  └──────────┘                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

### Complete File Tree

```
health-rehab/
├── .claude/                          # Claude Code configuration
│   ├── commands/                     # Custom slash commands
│   │   ├── test.md
│   │   ├── build.md
│   │   ├── safety.md
│   │   ├── commit.md
│   │   └── review.md
│   └── prompts/                      # Reusable prompt templates
│       ├── code-review.md
│       ├── feature-spec.md
│       └── test-plan.md
│
├── .codex/                           # Codex configuration
│   └── config.template.toml
│
├── .specify/memory/                  # Deep project documentation
│   ├── constitution.md               # Core principles
│   ├── architecture.md               # This file
│   ├── design-system.md              # UI/UX standards
│   └── roadmap.md                    # Development phases
│
├── public/                           # Static assets
│   ├── images/
│   └── icons/
│
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page (redirects to /dashboard)
│   │   ├── globals.css               # Global styles
│   │   │
│   │   └── (dashboard)/              # Dashboard route group
│   │       ├── layout.tsx            # Dashboard layout with sidebar
│   │       └── dashboard/            # Dashboard routes
│   │           ├── page.tsx          # Main dashboard overview
│   │           ├── pain/             # Pain tracking routes
│   │           │   └── page.tsx
│   │           ├── exercises/        # Exercise routes
│   │           │   ├── page.tsx      # Exercise library
│   │           │   ├── [id]/         # Exercise detail
│   │           │   └── session/      # Log session
│   │           ├── medication/       # Medication routes
│   │           │   └── page.tsx
│   │           ├── diet/             # Diet & nutrition routes
│   │           │   └── page.tsx
│   │           ├── progress/         # Progress analytics
│   │           │   └── page.tsx
│   │           ├── analytics/        # Advanced analytics
│   │           │   └── page.tsx
│   │           └── settings/         # User settings
│   │               └── page.tsx
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # Base UI components (Shadcn/Radix)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── label.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── loaders.tsx
│   │   │   └── data-empty.tsx
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── sidebar.tsx           # Navigation sidebar
│   │   │   └── header.tsx            # Top header bar
│   │   │
│   │   ├── pain/                     # Pain tracking components
│   │   │   ├── pain-log-form.tsx
│   │   │   └── pain-scale-selector.tsx
│   │   │
│   │   ├── exercise/                 # Exercise components (future)
│   │   ├── medication/               # Medication components (future)
│   │   ├── diet/                     # Diet components (future)
│   │   │
│   │   ├── settings/                 # Settings components
│   │   │   ├── ProfileSection.tsx
│   │   │   ├── MedicalSection.tsx
│   │   │   ├── PreferencesSection.tsx
│   │   │   └── BackupSection.tsx
│   │   │
│   │   └── service-worker-registration.tsx
│   │
│   ├── stores/                       # Zustand state management
│   │   ├── index.ts                  # Central exports
│   │   ├── user-store-v2.ts          # User profile & settings
│   │   ├── pain-store-v2.ts          # Pain logs & analytics
│   │   ├── exercise-store-v2.ts      # Exercise sessions & library
│   │   ├── medication-store.ts       # Medication schedules & logs
│   │   ├── diet-store.ts             # Meals & nutrition
│   │   └── ui-store.ts               # UI state (toasts, modals)
│   │
│   ├── lib/                          # Utilities & services
│   │   ├── db.ts                     # IndexedDB manager
│   │   ├── constants.ts              # App-wide constants & enums
│   │   ├── utils.ts                  # Helper functions
│   │   ├── validation.ts             # Zod validation schemas
│   │   ├── analytics.ts              # Analytics calculations
│   │   ├── performance.ts            # Performance monitoring
│   │   └── service-worker.ts         # Service Worker logic
│   │
│   ├── hooks/                        # Custom React hooks
│   │   └── use-toast.ts              # Toast notification hook
│   │
│   └── types/                        # TypeScript domain models
│       ├── index.ts                  # Central type exports
│       ├── user.ts                   # User, Profile types
│       ├── pain.ts                   # PainLog, PainAnalytics
│       ├── exercise.ts               # Exercise, ExerciseSession
│       ├── medication.ts             # Medication, MedicationLog
│       ├── diet.ts                   # MealLog, Food, Hydration
│       └── progress.ts               # ProgressMetrics
│
├── e2e/                              # Playwright E2E tests (future)
│   └── *.spec.ts
│
├── .github/                          # GitHub Actions (future)
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── Configuration Files
│   ├── package.json                  # Dependencies & scripts
│   ├── tsconfig.json                 # TypeScript strict config
│   ├── next.config.ts                # Next.js optimization
│   ├── postcss.config.mjs            # Tailwind integration
│   ├── vitest.config.ts              # Test configuration (future)
│   ├── playwright.config.ts          # E2E test config (future)
│   ├── .eslintrc.json                # Linting rules (future)
│   ├── .prettierrc                   # Formatting rules (future)
│   ├── .claudeignore                 # Claude ignore patterns
│   ├── netlify.toml                  # Netlify deployment
│   ├── .nvmrc                        # Node version (20)
│   └── .gitignore
│
└── Documentation
    ├── README.md                     # Project overview
    ├── QUICK_START.md                # Developer onboarding
    ├── AGENTS.md                     # AI assistant guardrails
    ├── PROJECT_SUMMARY.md            # Detailed project spec
    └── CLAUDE_OPTIMIZATION_ROADMAP.md # Implementation roadmap
```

---

## Data Models

### Core Domain Types

#### 1. User & Profile

```typescript
// src/types/user.ts

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfile {
  userId: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  medicalConditions: MedicalCondition[];
  preferences: UserPreferences;
}

interface MedicalCondition {
  id: string;
  name: string;
  diagnosedDate: Date;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  dataExportFormat: 'json' | 'csv';
}
```

#### 2. Pain Tracking

```typescript
// src/types/pain.ts

interface PainLog {
  id: string;
  userId: string;
  timestamp: Date;
  intensity: number; // 0-10 scale
  location: PainLocation;
  type: PainType;
  triggers?: string[];
  reliefMethods?: string[];
  notes?: string;
  tags?: string[];
}

type PainLocation =
  | 'cervical'
  | 'thoracic'
  | 'lumbar'
  | 'sacral'
  | 'shoulder'
  | 'hip'
  | 'other';

type PainType =
  | 'sharp'
  | 'dull'
  | 'aching'
  | 'burning'
  | 'tingling'
  | 'radiating';

interface PainAnalytics {
  period: 'week' | 'month' | 'year';
  averageIntensity: number;
  peakIntensity: number;
  totalLogs: number;
  commonLocations: Record<PainLocation, number>;
  trend: 'improving' | 'stable' | 'worsening';
}
```

#### 3. Exercise Tracking

```typescript
// src/types/exercise.ts

interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
  instructions: string[];
  targetMuscles: string[];
  equipment: Equipment[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  contraindications: string[];
  imageUrl?: string;
  videoUrl?: string;
}

type ExerciseCategory =
  | 'mobility'
  | 'strength'
  | 'stretching'
  | 'posture'
  | 'core';

type Equipment =
  | 'none'
  | 'resistance-band'
  | 'dumbbells'
  | 'mat'
  | 'foam-roller';

interface ExerciseSession {
  id: string;
  userId: string;
  exercises: ExerciseLog[];
  startTime: Date;
  endTime: Date;
  totalDuration: number; // minutes
  notes?: string;
  painBefore?: number; // 0-10
  painAfter?: number; // 0-10
}

interface ExerciseLog {
  exerciseId: string;
  sets: number;
  reps: number;
  duration?: number; // seconds (for holds)
  resistance?: number; // kg or band color
  completed: boolean;
}
```

#### 4. Medication Tracking

```typescript
// src/types/medication.ts

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: Frequency;
  prescribedBy?: string;
  startDate: Date;
  endDate?: Date;
  purpose: string;
  sideEffects?: string[];
  active: boolean;
}

interface Frequency {
  times: number; // times per day
  schedule?: string[]; // e.g., ["08:00", "20:00"]
  withFood?: boolean;
}

interface MedicationLog {
  id: string;
  medicationId: string;
  timestamp: Date;
  taken: boolean;
  skipped: boolean;
  skipReason?: string;
  sideEffects?: string[];
  notes?: string;
}
```

#### 5. Diet & Nutrition

```typescript
// src/types/diet.ts

interface MealLog {
  id: string;
  userId: string;
  timestamp: Date;
  mealType: MealType;
  foods: Food[];
  totalCalories: number;
  macros: Macronutrients;
  notes?: string;
  imageUrl?: string;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface Food {
  name: string;
  portion: number;
  unit: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  purineLevel?: 'low' | 'medium' | 'high'; // For gout management
}

interface Macronutrients {
  protein: number;
  carbs: number;
  fat: number;
}

interface HydrationLog {
  id: string;
  userId: string;
  timestamp: Date;
  amount: number; // ml
  type: 'water' | 'herbal-tea' | 'other';
}
```

#### 6. Progress Tracking

```typescript
// src/types/progress.ts

interface ProgressMetrics {
  userId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  pain: PainProgress;
  exercise: ExerciseProgress;
  diet: DietProgress;
  medication: MedicationProgress;
}

interface PainProgress {
  averagePain: number;
  trend: number; // -1 to 1 (negative = improving)
  painFreeDays: number;
  mostCommonLocation: PainLocation;
}

interface ExerciseProgress {
  totalSessions: number;
  totalDuration: number; // minutes
  adherenceRate: number; // 0-100%
  favoriteExercises: string[];
}

interface DietProgress {
  averageCalories: number;
  hydrationGoalMet: number; // days
  lowPurineDays: number;
  nutritionBalance: 'good' | 'fair' | 'needs-improvement';
}

interface MedicationProgress {
  adherenceRate: number; // 0-100%
  missedDoses: number;
  sideEffectReports: number;
}
```

---

## State Management

### Zustand Store Architecture

Each domain has its own Zustand store with consistent patterns:

#### Store Pattern

```typescript
// Example: src/stores/pain-store-v2.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/lib/db';
import type { PainLog, PainAnalytics } from '@/types/pain';

interface PainState {
  // State
  painLogs: PainLog[];
  analytics: PainAnalytics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addPainLog: (log: Omit<PainLog, 'id'>) => Promise<void>;
  updatePainLog: (id: string, updates: Partial<PainLog>) => Promise<void>;
  deletePainLog: (id: string) => Promise<void>;
  getPainLogs: (filters?: PainLogFilters) => Promise<PainLog[]>;
  calculateAnalytics: (period: 'week' | 'month' | 'year') => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

export const usePainStore = create<PainState>()(
  persist(
    (set, get) => ({
      // Initial state
      painLogs: [],
      analytics: null,
      isLoading: false,
      error: null,

      // Actions
      addPainLog: async (log) => {
        set({ isLoading: true, error: null });
        try {
          const newLog = { ...log, id: crypto.randomUUID() };
          await db.painLogs.add(newLog);
          set((state) => ({
            painLogs: [...state.painLogs, newLog],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      calculateAnalytics: async (period) => {
        const { painLogs } = get();
        const analytics = computePainAnalytics(painLogs, period);
        set({ analytics });
      },

      hydrate: async () => {
        try {
          const logs = await db.painLogs.getAll();
          set({ painLogs: logs });
        } catch (error) {
          console.error('Hydration failed:', error);
        }
      },

      // ... other actions
    }),
    {
      name: 'pain-store-v2',
      partialize: (state) => ({
        painLogs: state.painLogs,
      }),
    }
  )
);
```

### Store Initialization

```typescript
// src/app/(dashboard)/layout.tsx

'use client';

import { useEffect } from 'react';
import { usePainStore, useExerciseStore, useMedicationStore } from '@/stores';

export default function DashboardLayout({ children }) {
  useEffect(() => {
    // Hydrate all stores from IndexedDB on mount
    usePainStore.getState().hydrate();
    useExerciseStore.getState().hydrate();
    useMedicationStore.getState().hydrate();
    // ... other stores
  }, []);

  return <>{children}</>;
}
```

---

## Data Persistence

### IndexedDB Manager

```typescript
// src/lib/db.ts

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface HealthRehabDB extends DBSchema {
  painLogs: {
    key: string;
    value: PainLog;
    indexes: { 'by-timestamp': Date; 'by-location': PainLocation };
  };
  exercises: {
    key: string;
    value: Exercise;
    indexes: { 'by-category': ExerciseCategory };
  };
  exerciseSessions: {
    key: string;
    value: ExerciseSession;
    indexes: { 'by-date': Date };
  };
  medications: {
    key: string;
    value: Medication;
    indexes: { 'by-active': boolean };
  };
  medicationLogs: {
    key: string;
    value: MedicationLog;
    indexes: { 'by-timestamp': Date };
  };
  mealLogs: {
    key: string;
    value: MealLog;
    indexes: { 'by-timestamp': Date; 'by-type': MealType };
  };
  hydrationLogs: {
    key: string;
    value: HydrationLog;
    indexes: { 'by-timestamp': Date };
  };
  userProfile: {
    key: string;
    value: UserProfile;
  };
}

class DatabaseManager {
  private db: IDBPDatabase<HealthRehabDB> | null = null;

  async init() {
    this.db = await openDB<HealthRehabDB>('health-rehab-db', 1, {
      upgrade(db) {
        // Pain logs store
        const painStore = db.createObjectStore('painLogs', { keyPath: 'id' });
        painStore.createIndex('by-timestamp', 'timestamp');
        painStore.createIndex('by-location', 'location');

        // Exercises store
        const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id' });
        exerciseStore.createIndex('by-category', 'category');

        // ... other stores
      },
    });
  }

  // Generic CRUD operations
  async add<T extends keyof HealthRehabDB>(
    storeName: T,
    data: HealthRehabDB[T]['value']
  ) {
    if (!this.db) await this.init();
    return this.db!.add(storeName, data);
  }

  async get<T extends keyof HealthRehabDB>(
    storeName: T,
    key: string
  ) {
    if (!this.db) await this.init();
    return this.db!.get(storeName, key);
  }

  async getAll<T extends keyof HealthRehabDB>(storeName: T) {
    if (!this.db) await this.init();
    return this.db!.getAll(storeName);
  }

  async update<T extends keyof HealthRehabDB>(
    storeName: T,
    data: HealthRehabDB[T]['value']
  ) {
    if (!this.db) await this.init();
    return this.db!.put(storeName, data);
  }

  async delete<T extends keyof HealthRehabDB>(
    storeName: T,
    key: string
  ) {
    if (!this.db) await this.init();
    return this.db!.delete(storeName, key);
  }

  // Query by index
  async getByIndex<T extends keyof HealthRehabDB>(
    storeName: T,
    indexName: keyof HealthRehabDB[T]['indexes'],
    query: any
  ) {
    if (!this.db) await this.init();
    return this.db!.getAllFromIndex(storeName, indexName as string, query);
  }

  // Export all data
  async exportData() {
    const data = {
      painLogs: await this.getAll('painLogs'),
      exercises: await this.getAll('exercises'),
      medications: await this.getAll('medications'),
      // ... all tables
    };
    return data;
  }

  // Import data
  async importData(data: any) {
    // Clear existing data, import new data
    // with transaction for atomicity
  }
}

export const db = new DatabaseManager();
```

---

## API Structure (Future)

When backend is added in Phase 2:

### RESTful API Endpoints

```
Base URL: /api/v1

Authentication:
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh

User:
GET    /user/profile
PUT    /user/profile
DELETE /user/account

Pain Tracking:
GET    /pain-logs?start=YYYY-MM-DD&end=YYYY-MM-DD
POST   /pain-logs
PUT    /pain-logs/:id
DELETE /pain-logs/:id
GET    /pain-logs/analytics?period=week|month|year

Exercise:
GET    /exercises?category=mobility&difficulty=beginner
GET    /exercises/:id
POST   /exercise-sessions
GET    /exercise-sessions?start=YYYY-MM-DD
PUT    /exercise-sessions/:id
DELETE /exercise-sessions/:id

Medication:
GET    /medications
POST   /medications
PUT    /medications/:id
DELETE /medications/:id
GET    /medication-logs?medicationId=xxx
POST   /medication-logs

Diet:
GET    /meal-logs?date=YYYY-MM-DD
POST   /meal-logs
PUT    /meal-logs/:id
DELETE /meal-logs/:id
GET    /hydration-logs?date=YYYY-MM-DD
POST   /hydration-logs

Progress:
GET    /progress?period=week|month|year
GET    /progress/export?format=json|csv
```

---

## Performance Optimization

### Code Splitting Strategy

```typescript
// Dynamic imports for heavy components
const ExerciseLibrary = dynamic(() => import('@/components/exercise/library'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

// Route-based code splitting (automatic with Next.js App Router)
// Each page in app/ directory is automatically code-split
```

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/exercises/cat-cow.webp"
  alt="Cat-Cow Stretch"
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

### Bundle Analysis

```bash
# next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

# Analyze bundle
ANALYZE=true pnpm build
```

---

## Security Considerations

### Input Validation (Zod)

```typescript
// src/lib/validation.ts

import { z } from 'zod';

export const painLogSchema = z.object({
  intensity: z.number().min(0).max(10),
  location: z.enum(['cervical', 'thoracic', 'lumbar', 'sacral']),
  type: z.enum(['sharp', 'dull', 'aching', 'burning']),
  notes: z.string().max(500).optional(),
});

// Usage in form
const form = useForm({
  resolver: zodResolver(painLogSchema),
});
```

### XSS Prevention

- React auto-escapes all content
- Use DOMPurify for any raw HTML rendering

### Data Encryption (Future)

```typescript
// Encrypt sensitive medical data before IndexedDB storage
import { encrypt, decrypt } from '@/lib/crypto';

const encryptedNotes = encrypt(painLog.notes);
await db.painLogs.add({ ...painLog, notes: encryptedNotes });
```

---

## Deployment Strategy

### Current (Phase 1)

```yaml
# netlify.toml
[build]
  command = "yarn install && yarn build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Future (Phase 2)

```
Docker Containers:
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │  Next.js    │────►│  Fastify    │────►│ PostgreSQL  │
  │  Frontend   │     │   Backend   │     │  Database   │
  └─────────────┘     └─────────────┘     └─────────────┘
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                     ┌────────▼────────┐
                     │  Redis Cache    │
                     └─────────────────┘
```

---

## Monitoring & Observability

### Performance Monitoring (Future)

```typescript
// src/lib/performance.ts

export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);

  // Send to analytics (opt-in only)
  if (userConsent) {
    analytics.track('web-vital', {
      name: metric.name,
      value: metric.value,
    });
  }
}
```

### Error Tracking

```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
    // Log to error tracking service (Sentry, future)
  }
}
```

---

## Conclusion

This architecture ensures the Health Rehab app is:

- ✅ **Offline-first**: Works without internet
- ✅ **Performance**: < 1.5s load, < 100ms interactions
- ✅ **Scalable**: Easy to add backend when needed
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Type-safe**: TypeScript strict mode throughout
- ✅ **Testable**: Modular design enables comprehensive testing

Refer to `constitution.md` for principles and `roadmap.md` for implementation phases.
