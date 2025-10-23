# 🚀 Quick Start Development Guide

## Getting Started in 5 Minutes

This guide will help you set up the development environment and start building with **Next.js 15 App Router** and **Tailwind CSS**.

---

## ⚡ Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js version (must be 20+)
node --version  # Should show v20.x.x or higher

# Check pnpm (recommended) or npm
pnpm --version  # Should show 9.x.x or higher

# Check PostgreSQL
psql --version  # Should show 16.x or higher

# Check Git
git --version
```

### Install Prerequisites (if needed)

**Node.js 20 LTS:**

```bash
# macOS (using Homebrew)
brew install node@20

# Or use nvm
nvm install 20
nvm use 20
```

**pnpm:**

```bash
npm install -g pnpm@latest
```

**PostgreSQL 16:**

```bash
# macOS (using Homebrew)
brew install postgresql@16
brew services start postgresql@16
```

---

## 📦 Phase 1, Week 1: Next.js Project Setup (Start Here!)

### Step 1: Initialize Next.js 15 Project

```bash
# You're already in the project directory
cd /Users/haneefshaikh/Documents/Health\ Rehab

# Create Next.js app with App Router
pnpm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# This will set up:
# ✅ Next.js 15 with App Router
# ✅ TypeScript configured
# ✅ Tailwind CSS v3+
# ✅ src/ directory structure
# ✅ Path aliases (@/*)
```

### Step 2: Install Core Dependencies

```bash
# UI Component Libraries
pnpm add @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm add @radix-ui/react-toast @radix-ui/react-tabs @radix-ui/react-slider
pnpm add class-variance-authority clsx tailwind-merge lucide-react

# State Management
pnpm add zustand

# Data Fetching & Caching
pnpm add @tanstack/react-query

# Forms & Validation
pnpm add react-hook-form @hookform/resolvers zod

# Database & ORM
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit

# PWA Support
pnpm add next-pwa
pnpm add -D webpack

# Date & Time
pnpm add date-fns

# Development Dependencies
pnpm add -D @types/node @types/react @types/react-dom
pnpm add -D eslint-config-next prettier prettier-plugin-tailwindcss
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
pnpm add -D @playwright/test
```

### Step 3: Set up shadcn/ui Components

```bash
# Initialize shadcn/ui
pnpm dlx shadcn@latest init

# Follow the prompts:
# - TypeScript: Yes
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
# - Tailwind config: tailwind.config.ts
# - Components path: @/components
# - Utils path: @/lib/utils
# - React Server Components: Yes

# Install essential components
pnpm dlx shadcn@latest add button card input label textarea
pnpm dlx shadcn@latest add dialog dropdown-menu toast tabs slider
pnpm dlx shadcn@latest add form select checkbox switch
```

### Step 4: Configure Next.js for PWA

Create `next.config.mjs`:

```javascript
import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
```

### Step 5: Set up Database

```bash
# Create PostgreSQL database
createdb health_rehab_dev

# Create .env.local file
cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://localhost:5432/health_rehab_dev"

# NextAuth (if using authentication)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-a-secure-one"
EOF

# Create drizzle config
cat > drizzle.config.ts << 'EOF'
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
EOF
```

### Step 6: Create Initial Database Schema

Create `src/server/db/schema.ts`:

```typescript
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const painLogs = pgTable("pain_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  painLevel: integer("pain_level").notNull(),
  location: text("location").notNull(),
  sittingTolerance: integer("sitting_tolerance"),
  triggers: text("triggers"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  duration: integer("duration"),
  videoUrl: text("video_url"),
  instructions: jsonb("instructions"),
  contraindications: jsonb("contraindications"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Step 7: Run Database Migrations

```bash
# Generate migration
pnpm drizzle-kit generate

# Apply migration
pnpm drizzle-kit migrate
```

### Step 8: Update package.json Scripts

Add these scripts to your `package.json`:

```json
"scripts": {
  "dev": "next dev --turbo",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:e2e": "playwright test",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio"
}
```

    "typescript": "^5.3.3"

}
}
EOF

# Create tsconfig.json

cat > tsconfig.json << 'EOF'
{
"compilerOptions": {
"target": "ES2020",
"useDefineForClassFields": true,
"lib": ["ES2020", "DOM", "DOM.Iterable"],
"module": "ESNext",
"skipLibCheck": true,
"moduleResolution": "bundler",
"allowImportingTsExtensions": true,
"resolveJsonModule": true,
"isolatedModules": true,
"noEmit": true,
"jsx": "react-jsx",
"strict": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"noFallthroughCasesInSwitch": true,
"baseUrl": ".",
"paths": {
"@/_": ["./src/_"],
"@/features/_": ["./src/features/_"],
"@/shared/_": ["./src/shared/_"]
}
},
"include": ["src"],
"references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Create vite.config.ts

cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
plugins: [
react(),
VitePWA({
registerType: 'autoUpdate',
includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
manifest: {
name: 'Health Rehab Assistant',
short_name: 'Health Rehab',
description: 'Spine Health & Rehabilitation Assistant',
theme_color: '#3b82f6',
icons: [
{
src: 'icons/icon-192.png',
sizes: '192x192',
type: 'image/png'
},
{
src: 'icons/icon-512.png',
sizes: '512x512',
type: 'image/png'
}
]
}
})
],
resolve: {
alias: {
'@': path.resolve(**dirname, './src'),
'@/features': path.resolve(**dirname, './src/features'),
'@/shared': path.resolve(\_\_dirname, './src/shared')
}
},
server: {
port: 5173,
open: true
},
build: {
target: 'es2020',
sourcemap: true,
rollupOptions: {
output: {
manualChunks: {
'react-vendor': ['react', 'react-dom', 'react-router-dom'],
'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
}
}
}
}
})
EOF

# Create tailwind.config.js

cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} \*/
export default {
content: [
"./index.html",
"./src/**/\*.{js,ts,jsx,tsx}",
],
theme: {
extend: {
colors: {
primary: {
50: '#eff6ff',
500: '#3b82f6',
600: '#2563eb',
700: '#1d4ed8',
},
secondary: {
50: '#f0fdf4',
500: '#22c55e',
600: '#16a34a',
700: '#15803d',
}
}
},
},
plugins: [],
}
EOF

cd ../..

````

### Step 4: Initialize Backend API

```bash
cd apps/api

# Create package.json
cat > package.json << 'EOF'
{
  "name": "@health-rehab/api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint . --ext ts --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit",
    "db:setup": "tsx scripts/setup-db.ts",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "tsx scripts/seed-db.ts",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "fastify": "^4.26.0",
    "@fastify/cors": "^9.0.1",
    "@fastify/helmet": "^11.1.1",
    "@fastify/jwt": "^7.2.4",
    "drizzle-orm": "^0.29.3",
    "postgres": "^3.4.3",
    "redis": "^4.6.12",
    "bcrypt": "^5.1.1",
    "zod": "^3.22.4",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.16",
    "@types/bcrypt": "^5.0.2",
    "tsx": "^4.7.0",
    "drizzle-kit": "^0.20.14",
    "vitest": "^1.3.0",
    "supertest": "^6.3.4",
    "typescript": "^5.3.3"
  }
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

cd ../..
````

### Step 5: Install Dependencies

```bash
# Install all dependencies
pnpm install

# This will install dependencies for:
# - Root workspace
# - apps/web
# - apps/api
```

### Step 6: Set Up Git and Husky

```bash
# Initialize git (if not already done)
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
dist/
build/

# Misc
.DS_Store
*.log
*.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Cache
.cache/
.parcel-cache/
.next/
EOF

# Set up Husky
pnpm dlx husky-init
pnpm install

# Configure pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
EOF

# Create lint-staged config
cat > .lintstagedrc << 'EOF'
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
EOF

chmod +x .husky/pre-commit
```

### Step 7: Create Basic App Entry Points

```bash
# Create web app entry
cat > apps/web/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Spine Health & Rehabilitation Assistant" />
    <title>Health Rehab Assistant</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > apps/web/src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

cat > apps/web/src/app/App.tsx << 'EOF'
function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">
          Health Rehab Assistant
        </h1>
        <p className="text-gray-600">
          Your journey to spine health starts here 🏥
        </p>
      </div>
    </div>
  )
}

export default App
EOF

cat > apps/web/src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  padding: 0;
}
EOF

# Create API entry
cat > apps/api/src/server.ts << 'EOF'
import Fastify from 'fastify'

const server = Fastify({
  logger: true
})

server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' })
    console.log('🚀 Server running at http://localhost:3000')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
EOF
```

### Step 8: Start Development

```bash
# Terminal 1: Start frontend
cd apps/web
pnpm dev

# Terminal 2: Start backend
cd apps/api
pnpm dev

# Or from root (both at once):
pnpm dev
```

Visit `http://localhost:5173` - you should see your app! 🎉

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] `pnpm dev` starts both frontend and backend
- [ ] Frontend loads at http://localhost:5173
- [ ] Backend health check works: http://localhost:3000/health
- [ ] Hot reload works (edit `App.tsx` and see changes)
- [ ] TypeScript compiles without errors: `pnpm type-check`
- [ ] Linting works: `pnpm lint`

---

## 📚 Next Steps

1. **Week 1-2 Tasks**: Continue with infrastructure setup

   - Set up ESLint and Prettier configs
   - Configure PostgreSQL database
   - Create database schema with Drizzle
   - Set up CI/CD with GitHub Actions
   - Create UI component library

2. **Start Building Features**: Move to Week 3-4

   - Pain tracker implementation
   - Exercise library

3. **Follow TDD**: Write tests first!

---

## 🆘 Troubleshooting

**Port already in use:**

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**pnpm command not found:**

```bash
npm install -g pnpm
```

**TypeScript errors:**

```bash
# Clean and reinstall
pnpm clean
pnpm install
```

---

## 📖 Documentation References

- [Constitution](./.specify/memory/constitution.md) - Core principles
- [Architecture](./.specify/memory/architecture.md) - Technical design
- [Roadmap](./.specify/memory/roadmap.md) - Development phases
- [Design System](./.specify/memory/design-system.md) - UI guidelines

---

**Ready to build something amazing!** 🚀
