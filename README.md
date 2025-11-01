# Haneef's Spine Health & Rehabilitation Assistant 🏥

A privacy-first **Next.js 15** dashboard that helps a single user (Haneef) log pain, follow spine-safe exercise plans, track medication, and capture diet notes—without compromising medical safety or offline usability.

## ✨ What’s in the build today

- **Dashboard overview** – `/dashboard` aggregates current pain level, exercise progress, medication reminders, and quick actions (`src/app/(dashboard)/dashboard/page.tsx`).
- **Pain logging** – Guided form with symptom fields, sitting tolerance, and clinician-ready notes (`src/components/pain/pain-log-form.tsx`).
- **Exercise sessions** – Curated routines seeded in IndexedDB with session tracking (`src/stores/exercise-store-v2.ts`).
- **Diet & hydration notes** – Lightweight store for meals and hydration logs (`src/stores/diet-store.ts`).
- **Medication tracker** – Local schedule management with adherence toggles (`src/stores/medication-store.ts`).
- **Offline scaffolding** – IndexedDB helpers (`src/lib/db`) plus service-worker registration keep the app responsive when the network is absent.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 App Router, React 19, TypeScript 5 (strict)
- **Styling**: Tailwind CSS, shadcn/ui, Radix primitives
- **State**: Zustand stores with IndexedDB persistence
- **Forms & validation**: React Hook Form + Zod
- **Icons**: Lucide React

## 🚀 Getting started

```bash
# Clone and enter
git clone https://github.com/yourusername/health-rehab.git
cd health-rehab

# Use Node 20 (see .nvmrc)
npm install

# Launch the dashboard
npm run dev
```

Open **http://localhost:3000/dashboard**. The build is single-user and stores data locally; backend services and PostgreSQL integration are staged for a future milestone.

### Available scripts

| Command          | Purpose                                               |
| ---------------- | ----------------------------------------------------- |
| `npm run dev`    | Run Next.js in development mode                       |
| `npm run build`  | Type-check and produce a production bundle (required before handoff) |
| `npm run start`  | Serve the production bundle locally                   |

> Per the constitution, install or remove dependencies one at a time (`npm install <name>`). Avoid batch installs that mask failures.

## 📁 Project layout

```
.
├── src/
│   ├── app/                 # App Router pages + API stubs
│   ├── components/          # Domain components + shared UI primitives
│   ├── stores/              # Zustand stores (pain, exercise, diet, medication, user)
│   ├── lib/                 # IndexedDB manager, utilities
│   ├── hooks/               # Reusable hooks
│   └── types/               # Domain models
├── AGENTS.md                # High-level guardrails (auto-loaded by Codex)
├── .codex/config.template.toml  # Optional Codex fallback configuration
├── .specify/memory/         # Detailed constitution, architecture, design system, roadmap
└── QUICK_START.md           # Onboarding checklist
```

## 🧭 Working with Codex

Codex automatically reads `AGENTS.md`, which distils the non-negotiable rules: medical safety, performance (<1.5 s initial load, <100 ms interactions), TDD discipline, and dependency hygiene. For deeper context, copy `.codex/config.template.toml` to `~/.codex/config.toml` or launch Codex with:

```bash
codex --config project_doc_fallback_filenames='["constitution.md","architecture.md","design-system.md","roadmap.md"]'
```

This surfaces the canonical specs in `.specify/memory/` alongside the summary guidance.

## ✅ Definition of done

Before you declare a change complete:

1. Respect the safety rules—no exercises or guidance that conflicts with Haneef's diagnosed conditions.
2. Update or add tests (Vitest/Playwright) for modified behaviour.
3. Run `npm run build` and resolve all warnings/errors.
4. Document user-facing changes in this README or `QUICK_START.md`.

## 🔭 Roadmap highlights

- Replace mock API calls with secure persistence (PostgreSQL + Drizzle) while keeping an offline fallback.
- Expand dashboard analytics with charts sourced from the pain and exercise stores.
- Add notification scheduling for medication, posture breaks, and heat therapy.

## 📄 License

This project is released under the [MIT License](./LICENSE).
