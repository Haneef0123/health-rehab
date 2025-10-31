# Haneef's Spine Health & Rehabilitation Assistant – Agent Guide

This repository powers a **single-user**, privacy-focused recovery dashboard. Follow the guardrails below whenever you work with Codex or other automation in this project.

## Non-negotiable safety principles

- All UX, copy, and data flows must emphasise medical safety and advise the user to confirm actions with a qualified clinician.
- Never introduce exercises or recommendations that conflict with cervical lordosis loss, thoracic kyphosis, or L4/L5-S1 disc bulge constraints. Avoid compression-heavy movements (deadlifts, crunches, twisting, long unsupported sitting).
- Preserve or reinstate the global safety disclaimer if you touch layout files (`src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`, or shared components).

## Performance and UX expectations

- Target sub-1.5 s initial load and <100 ms interactive updates. Prefer incremental rendering and lazy loading over large synchronous blocks.
- Optimise assets (images, icons, fonts) and respect the existing design system in `src/components/ui`.
- Ensure the app continues to run offline or degrades gracefully; do not introduce network-only hard dependencies without a fallback.

## Development workflow

- Follow a test-first mindset for behaviour changes. Add or update Vitest/Playwright coverage for new logic in `src/stores`, `src/components`, or API routes under `src/app/api`.
- Run `pnpm build` before declaring work complete; resolve every TypeScript error and build warning.
- Keep commits scoped: one purposeful change per PR/iteration so health audits remain traceable.
- Install or remove packages one at a time (`pnpm add package-name`), mirroring the constitution rule to keep dependency churn obvious.

## Data & privacy

- The app stores sensitive health data locally through Zustand stores and future API routes. Do not add third-party analytics or telemetry without explicit opt-in UX.
- If you add persistence, prefer encrypted storage and document migration steps in `README.md`.

## When in doubt

- Review the deeper project canon under `.specify/memory/`:
  - `constitution.md` – full safety, performance, and workflow charter.
  - `architecture.md` – layer diagrams, data models, and domain boundaries.
  - `design-system.md` – tokens, components, accessibility rules.
  - `roadmap.md` – phased feature priorities.
- Surface any conflicts between new requirements and those documents in your summary before proceeding.

## Required finishing checklist

1. Implement the change with user safety top-of-mind.
2. Update docs or UI copy if behaviour or data collection shifts.
3. Run `pnpm lint` (when configured) and `pnpm build`.
4. Note remaining TODOs explicitly if a feature ship is staged.

Thank you for treating this rehabilitation assistant with the same care a clinician would. Anything that could affect the user’s wellbeing must be explicit, documented, and reversible.
