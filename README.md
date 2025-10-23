# Haneef's Spine Health & Rehabilitation Assistant 🏥

> A high-performance, offline-first Progressive Web Application for comprehensive spine health management, exercise guidance, and wellness tracking.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF)](https://vitejs.dev/)

## 🎯 Project Vision

A personalized, intelligent health companion designed specifically for managing spinal health conditions including loss of cervical lordosis, thoracic kyphosis, and lumbar disc bulges. This application integrates evidence-based exercises, naturopathic dietary principles, and comprehensive health tracking into a single, easy-to-use platform.

## ✨ Key Features

### Phase 1 (MVP) - Available Now

- 📊 **Pain & Symptom Tracking**: Log pain levels, locations, triggers, and sitting tolerance
- 🏋️ **Spine-Safe Exercise Library**: Curated exercises with video guidance and safety checks
- ⏰ **Intelligent Posture Timer**: Automatic reminders to take breaks every 15 minutes
- 💊 **Medication Tracker**: Never miss your Pregabalin or B12 supplements
- 📱 **Offline-First PWA**: Works without internet, syncs when online

### Phase 2 (Coming Soon)

- 🥗 **Diet & Hydration Manager**: Track meals aligned with naturopathic principles
- 📈 **Progress Visualization**: Charts and trends for pain, sitting tolerance, and more
- 📅 **Adaptive Exercise Plans**: Weekly plans that adjust based on your progress
- 💡 **Ergonomic Guidance**: Posture tips specific to your conditions

### Phase 3 (Planned)

- 🩸 **Blood Report Tracking**: Monitor uric acid, platelets, and other markers
- 🍎 **Targeted Dietary Guidance**: Smart suggestions for purine management and platelet support
- 📚 **Educational Content Hub**: Learn about your conditions and recovery
- 🔥 **Heat Therapy Reminders**: Scheduled prompts for therapeutic activities

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20+ LTS
- **pnpm**: 8+ (recommended) or npm
- **PostgreSQL**: 16+
- **Redis**: 7+ (optional for caching)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/health-rehab.git
cd health-rehab

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up the database
pnpm db:setup

# Start development servers
pnpm dev
```

The app will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Build for Production

```bash
# Build all apps
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## 📁 Project Structure

```
health-rehab/
├── apps/
│   ├── web/                    # Frontend PWA (React + Vite)
│   └── api/                    # Backend API (Fastify + TypeScript)
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── types/                  # Shared TypeScript types
│   ├── utils/                  # Shared utilities
│   └── config/                 # Shared configuration
├── docs/                       # Documentation
├── .specify/                   # Speckit configuration
└── scripts/                    # Build & deployment scripts
```

## 🛠️ Tech Stack

### Frontend

- **React 18.3+**: UI library with concurrent features
- **TypeScript 5.3+**: Type safety
- **Vite 5+**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible primitives
- **Zustand**: Lightweight state management
- **React Query**: Server state & caching
- **React Hook Form + Zod**: Forms & validation
- **Recharts**: Data visualization

### Backend

- **Node.js 20 LTS**: Runtime
- **Fastify 4+**: High-performance framework
- **TypeScript 5.3+**: Type safety
- **PostgreSQL 16+**: Primary database
- **Drizzle ORM**: Type-safe database queries
- **Redis 7+**: Caching (optional)
- **JWT**: Authentication

### DevOps & Quality

- **pnpm**: Fast, disk-efficient package manager
- **Vitest**: Unit & integration testing
- **Playwright**: E2E testing
- **ESLint + Prettier**: Code quality
- **Husky**: Git hooks
- **GitHub Actions**: CI/CD
- **Docker**: Containerization

## 🏗️ Architecture

This project follows a **monorepo architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│              Frontend (PWA)                 │
│  React + TypeScript + Service Worker       │
├─────────────────────────────────────────────┤
│          State Management                   │
│  Zustand (local) + React Query (server)    │
├─────────────────────────────────────────────┤
│           API Gateway                       │
│           Fastify REST API                  │
├─────────────────────────────────────────────┤
│       Domain Logic Layer                    │
│  Health │ Exercise │ Diet │ Progress       │
├─────────────────────────────────────────────┤
│         Data Access Layer                   │
│     Drizzle ORM + PostgreSQL               │
└─────────────────────────────────────────────┘
```

### Key Design Principles

1. **Offline-First**: Core features work without internet
2. **Performance**: < 1.5s load time, < 100ms interactions
3. **Type Safety**: Full TypeScript coverage with strict mode
4. **Test-Driven**: Comprehensive test coverage at all layers
5. **Accessibility**: WCAG 2.1 AA compliant
6. **Modularity**: Domain-driven design, clear boundaries

## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Architecture](./docs/architecture/README.md)**: System design and patterns
- **[API Documentation](./docs/api/README.md)**: API endpoints and schemas
- **[User Guide](./docs/user-guide/README.md)**: How to use the app
- **[Development Guide](./docs/development/README.md)**: Contributing and development
- **[Constitution](./.specify/memory/constitution.md)**: Core principles and standards
- **[Roadmap](./.specify/memory/roadmap.md)**: Development phases and timeline

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test pain-tracking.test.ts
```

### Test Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys
- **Visual Regression**: Key UI components

## 🎨 Design System

The application uses a custom design system built on:

- **Color System**: Calming blues and healing greens
- **Typography**: Inter (body), Manrope (headings)
- **Components**: Built with Radix UI primitives
- **Animations**: Smooth 60fps transitions
- **Dark Mode**: Full support

See [Design System Documentation](./.specify/memory/design-system.md) for details.

## 🔒 Security

- ✅ Authentication via JWT with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (input sanitization)
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Secure headers (Helmet.js)
- ✅ HTTPS only in production
- ✅ Environment variable protection

## 📊 Performance Metrics

### Target Metrics (Lighthouse)

- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 95
- **SEO**: > 90

### Bundle Size Targets

- **Initial bundle**: < 200KB gzipped
- **Lazy-loaded routes**: < 100KB each
- **Total initial download**: < 500KB

### Runtime Performance

- **First Contentful Paint**: < 1.0s
- **Time to Interactive**: < 2.0s
- **Cumulative Layout Shift**: < 0.1

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

### Development Workflow

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Write tests first (TDD approach)
3. Implement the feature
4. Ensure all tests pass: `pnpm test`
5. Lint and format: `pnpm lint && pnpm format`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add pain trend visualization
fix: resolve timer notification issue
docs: update API documentation
test: add tests for exercise logger
chore: update dependencies
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Medical Guidance**: Dr. Manthena Satyanarayana Raju's naturopathy principles
- **Exercise Content**: Based on evidence-based physiotherapy practices
- **Design Inspiration**: Modern health apps (MyFitnessPal, Headspace, Calm)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)

## 📞 Support

For questions, issues, or feedback:

- **Issues**: [GitHub Issues](https://github.com/yourusername/health-rehab/issues)
- **Email**: your.email@example.com
- **Documentation**: [Full Docs](./docs/README.md)

## 🗺️ Roadmap

### Current Phase: Phase 1 (MVP) ✅

- [x] Project setup
- [x] Pain tracking
- [x] Exercise library
- [x] Posture timer
- [x] Medication tracking

### Next: Phase 2 (Q1 2025)

- [ ] Diet & hydration tracking
- [ ] Progress visualization
- [ ] Adaptive exercise plans
- [ ] Ergonomic guidance

### Future: Phase 3 (Q2 2025)

- [ ] Blood report tracking
- [ ] Advanced dietary guidance
- [ ] Educational content
- [ ] Heat therapy reminders

See the [detailed roadmap](./.specify/memory/roadmap.md) for more information.

## 💡 Philosophy

This project embodies several key principles:

1. **Health First**: Every feature is designed with medical safety in mind
2. **User Experience**: Zero lag, elegant UI, delightful interactions
3. **Data Ownership**: Your health data belongs to you, exportable anytime
4. **Privacy**: No tracking, no ads, no third-party data sharing
5. **Sustainability**: Built to last, maintainable, well-documented
6. **Evidence-Based**: Grounded in medical research and naturopathic principles

---

**Built with ❤️ for better spinal health and wellness**

**Version**: 1.0.0 | **Status**: Active Development | **Last Updated**: 2025-10-22
