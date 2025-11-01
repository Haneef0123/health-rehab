# 🚀 Quick Start

Use this guide when you onboard a new machine or reset the workspace. It mirrors the expectations in `AGENTS.md` and keeps Codex aligned with the latest repo state.

## 1. Prerequisites

- **Node.js 20** (see `.nvmrc`)
- **npm** (included with Node.js)
- A modern browser (Chrome, Edge, or Safari) for IndexedDB support

## 2. Install & Run

```bash
# Clone and enter the repo
git clone https://github.com/yourusername/health-rehab.git
cd health-rehab

# Use Node 20
nvm use 20    # or install via asdf/volta if preferred

# Install dependencies (one command, clean workspace)
npm install

# Launch the app
npm run dev
```

Visit **http://localhost:3000/dashboard**. The landing page redirects automatically.

## 3. Recommended workflow

1. Open the dashboard and perform a full manual smoke test (pain log, exercise session, medication toggle).
2. Make changes in a feature branch, keeping the domain safety rules from `AGENTS.md` front-of-mind.
3. Add or update tests as you touch stores/components.
4. Run `npm run build` before you share results with Haneef.

## 4. Key project docs

- `AGENTS.md` – summary instructions Codex reads automatically.
- `.specify/memory/constitution.md` – complete safety/performance charter.
- `.specify/memory/architecture.md` – data models, storage, and planned integrations.
- `.specify/memory/design-system.md` – UI tokens, accessibility expectations.

If you rely on Codex, copy `.codex/config.template.toml` to `~/.codex/config.toml` so those deep docs are ingested automatically.

## 5. Troubleshooting

- **Build errors**: run `npm run build` locally; resolve TypeScript issues before continuing.
- **IndexedDB issues**: clear browser storage for `http://localhost:3000` to reset seed data.
- **Dependency drift**: install packages one at a time (`npm install <name>`) to keep diffs and failures obvious, per the constitution.

You are now ready to iterate safely on the rehabilitation assistant. Take care of the medical disclaimers and keep the UX snappy. 💙
